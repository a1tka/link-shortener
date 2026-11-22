const express = require("express");
const crypto = require("crypto");
const Link = require("../models/Link");

const router = express.Router();
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RESERVED = ["api", "assets"];

const randomCode = (len = 6) =>
  Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("");

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// BASE_URL wins if set (handy locally, where the API is on :5000).
// Otherwise use whatever domain the request came in on (works on Vercel).
const baseUrl = (req) => process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

const toJSON = (link, base) => ({
  id: link._id,
  code: link.code,
  originalUrl: link.originalUrl,
  shortUrl: `${base}/${link.code}`,
  clicks: link.clicks,
  createdAt: link.createdAt,
});

// Create
router.post("/", async (req, res) => {
  try {
    const { url, alias } = req.body;
    if (!url || !isValidUrl(url.trim())) {
      return res.status(400).json({ message: "Enter a full URL starting with http:// or https://" });
    }

    let code = alias && alias.trim();
    if (code) {
      if (!/^[A-Za-z0-9_-]{3,30}$/.test(code) || RESERVED.includes(code.toLowerCase())) {
        return res.status(400).json({ message: "Alias must be 3-30 letters, numbers, - or _" });
      }
      if (await Link.exists({ code })) {
        return res.status(409).json({ message: "That alias is taken. Try another." });
      }
    } else {
      do { code = randomCode(); } while (await Link.exists({ code }));
    }

    const link = await Link.create({ code, originalUrl: url.trim() });
    res.status(201).json(toJSON(link, baseUrl(req)));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "That alias is taken. Try another." });
    }
    res.status(500).json({ message: "Could not create the link." });
  }
});

// List
router.get("/", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    const base = baseUrl(req);
    res.json(links.map((l) => toJSON(l, base)));
  } catch {
    res.status(500).json({ message: "Could not load links." });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found." });
    res.json({ message: "Deleted" });
  } catch {
    res.status(400).json({ message: "Invalid link id." });
  }
});

module.exports = router;
