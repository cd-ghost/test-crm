// Target the raw typescript source entry point directly
const { createApp } = require('../src/app');

const app = createApp();

module.exports = app;
module.exports.default = app;
