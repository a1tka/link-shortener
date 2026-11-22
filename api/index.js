// Vercel serverless entry point. Every request that isn't a static file
// (see vercel.json rewrites) lands here and is handled by the Express app.
module.exports = require("../server/app");
