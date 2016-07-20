var settings = require('./Settings'),
    browser,
    config;

function Webpage() {

};

Webpage.prototype.create = function() {
  return new Promise((resolve, reject) => {
    browser.createPage().then((page) => {
      settings.default_settings(page, config);
      resolve(page);
    });
  });
};

module.exports = Webpage;
