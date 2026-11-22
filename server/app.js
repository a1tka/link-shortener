const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Link = require("./models/Link");
const linksRouter = require("./routes/links");

const app = express();
app.set("trust proxy", 1); // so req.protocol is "https" behind Vercel's proxy
app.use(cors());
app.use(express.json());

// Make sure the DB is connected before any route runs.
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    res.status(503).json({ message: "Database unavailable. Check MONGO_URI." });
  }
});

app.use("/api/links", linksRouter);

// Redirect: GET /:code
app.get("/:code", async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { clicks: 1 } }
    );
    if (!link) return res.status(404).send("Short link not found.");
    res.redirect(link.originalUrl);
  } catch {
    res.status(500).send("Something went wrong.");
  }
});

module.exports = app;
