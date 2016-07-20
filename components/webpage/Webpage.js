var settings = require('./Settings');

function Webpage(browser, config) {
  this.browser = browser;
};

Webpage.prototype.create = function() {
  var BROWSER = this.browser,
      CONFIG = this.config;

  return new Promise((resolve, reject) => {
    BROWSER.createPage().then((page) => {
      settings.default_settings(page, CONFIG);
      resolve(page);
    });
  });
};

module.exports = Webpage;
