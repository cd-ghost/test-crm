const { createApp } = require('../dist/app');

// Vercel serverless entrypoint.
// - Expects DATABASE_URL, JWT_SECRET, etc injected via Vercel environment variables.
// - TypeScript is compiled to dist/ during build.
// - Export the Express app instance for @vercel/node to invoke.

const app = createApp();

module.exports = app;
module.exports.default = app;

