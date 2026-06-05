let createApp;

try {
  // Option A: Try to load it from direct dist folder
  createApp = require('../dist/server').createApp;
} catch (err) {
  try {
    // Option B: Try to load it from nested dist/src folder structure
    createApp = require('../dist/src/server').createApp;
  } catch (nestedErr) {
    // Option C: Check if app naming structure was preferred instead
    try {
      createApp = require('../dist/app').createApp;
    } catch (finalErr) {
      console.error("Build path diagnostic failed.");
      throw new Error("Could not find compiled server or app module in any build folder layout.");
    }
  }
}

// Vercel serverless entrypoint invocation
const app = createApp();

module.exports = app;
module.exports.default = app;
