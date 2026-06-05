let createApp;

try {
  // Try compiled build folder path
  createApp = require('../build/app').createApp;
} catch (buildErr) {
  try {
    // Try raw source path (Vercel's compiler handles this on the fly)
    createApp = require('../src/app').createApp;
  } catch (srcErr) {
    try {
      // Fallback path check
      createApp = require('./build/app').createApp;
    } catch (finalErr) {
      console.error("Backend initialization path mapping failed completely.");
      throw new Error("Could not find application instance module in any known directory.");
    }
  }
}

const app = createApp();

module.exports = app;
module.exports.default = app;
