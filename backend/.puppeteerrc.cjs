const { join } = require('path');

/**
 * Puppeteer configuration file.
 * Redirects Puppeteer browser installation cache to backend/.cache/puppeteer
 * so that Chrome binaries are stored INSIDE the project directory and preserved
 * between Render build phase and runtime deployment.
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
