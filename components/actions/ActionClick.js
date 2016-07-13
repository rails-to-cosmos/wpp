var oop = require('oop-module');

exports.constructor = (_config, _result_store, _browser_instance) => {
  exports.config = _config;
  exports.result_store = _result_store;
  exports.browser_instance = _browser_instance;
};

exports.do = () => {
  return new Promise((resolve, reject) => {
    // var pages = _super.result_store.get(_super.config.target);
    // var selector = _super.config.data.selector;

    // var click_actions = pages.map((page) => {
    //   return new Promise((resolveClick) => {
    //     page.on('onLoadFinished', (status) => {
    //       resolveClick();
    //       _super.result_store.push(_super.config.name, page, false);
    //     });

    //     page.evaluate((selector) => {
    //       var e = document.createEvent('MouseEvents');
    //       e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    //       document.querySelector(selector).dispatchEvent(e);
    //     }, selector);
    //   });
    // });

    // Promise.all(click_actions).then(() => {
    //   resolve();
    // });
    resolve();
  });
};
