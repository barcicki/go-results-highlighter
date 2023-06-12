const path = require('path');

module.exports = {
  TARGET: path.join(__dirname, '../dist'),
  COMPONENT: path.join(__dirname, '../src/component.js'),
  LIB: path.join(__dirname, '../src'),
  SITE: path.join(__dirname, '../site'),
  BOOKMARK: path.join(__dirname, '../src/bookmark'),
  PAGES: path.join(__dirname, '../site/pages')
};
