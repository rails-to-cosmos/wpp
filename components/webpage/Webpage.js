const settings = require('./Settings');

function Webpage(browser, config) {
  this.browser = browser;
};

Webpage.prototype.create = function() {
  const BROWSER = this.browser,
        CONFIG = this.config;

  return new Promise(function (resolve, reject) {
    BROWSER.createPage().then(function (page) {
      settings.default_settings(BROWSER, page, CONFIG);
      resolve(page);
    }, function(exc) {
      reject(exc);
    });
  });
};

module.exports = Webpage;
