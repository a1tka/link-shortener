const mongoose = require("mongoose");

// Serverless functions are frozen/reused between requests, so keep the
// connection (and the in-flight promise) on `global` to avoid opening a
// new connection on every call.
let cache = global.__mongoose;
if (!cache) cache = global.__mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set.");
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

module.exports = connectDB;
