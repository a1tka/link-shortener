// Local development entry point. (Vercel uses api/index.js instead.)
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const app = require("./app");
const connectDB = require("./db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
