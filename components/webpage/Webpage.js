const settings = require('./Settings');

function Webpage(browser, config) {
  this.browser = browser;
};

Webpage.prototype.create = function() {
  const BROWSER = this.browser,
        CONFIG = this.config;

  return new Promise((resolve, reject) => {
    BROWSER.createPage().then((page) => {
      settings.default_settings(page, CONFIG);
      resolve(page);
    });
  });
};

module.exports = Webpage;
