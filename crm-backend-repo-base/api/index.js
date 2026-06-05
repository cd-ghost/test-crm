// api/index.js — Vercel serverless entry point
// TypeScript compiles src/ → dist/ (see tsconfig.json outDir)
// This file lives at crm-backend-repo-base/api/index.js
// So ../dist/app resolves to crm-backend-repo-base/dist/app.js ✓

const { createApp } = require('../dist/app');

const app = createApp();

module.exports = app;
module.exports.default = app;
