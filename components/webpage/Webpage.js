const settings = require('./Settings');

function Webpage(browser, config) {
  this.browser = browser;
  this.page = null;
};

Webpage.prototype.create = function() {
  const WP = this,
        BROWSER = this.browser,
        CONFIG = this.config;

  return new Promise(function (resolve, reject) {
    BROWSER.createPage().then(function (page) {
      WP.page = page;
      settings.default_settings(BROWSER, page, CONFIG);
      resolve(page);
    }, function(exc) {
      reject(exc);
    });
  });
};

module.exports = Webpage;
