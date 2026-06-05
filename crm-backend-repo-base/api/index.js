const { createApp } = require('../build/app');

// Vercel serverless entrypoint configuration
const app = createApp();

module.exports = app;
module.exports.default = app;
