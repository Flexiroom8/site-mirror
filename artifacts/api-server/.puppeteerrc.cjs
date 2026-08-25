const path = require('node:path');

module.exports = {
  cacheDirectory: path.resolve(__dirname, '.cache', 'puppeteer'),
};
