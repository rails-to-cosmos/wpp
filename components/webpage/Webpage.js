var oop = require('oop-module'),
    settings = require('./Settings'),
    browser,
    config;

exports.constructor = (_browser, _config) => {
  browser = _browser;
  config = _config;
};

exports.create = () => {
  return new Promise((resolve, reject) => {
    browser.createPage().then((page) => {
      settings.default_settings(page, config);
      resolve(page);
    });
  });
};
