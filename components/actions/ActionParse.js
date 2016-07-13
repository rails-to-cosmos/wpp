var oop = require('oop-module'),
    cheerio = require('cheerio'),

    is_object = require('../../utils').is_object,
    is_string = require('../../utils').is_string;

exports.constructor = (_config, _result_store, _browser_instance) => {
  exports.config = _config;
  exports.result_store = _result_store;
  exports.browser_instance = _browser_instance;
};

exports.do = () => {
  return new Promise((resolve, reject) => {
    var selector = exports.config.data.selector;
    var pages = exports.result_store.get(exports.config.target);
    selector = selector.replace('[outerHTML]', '');
    exports.result_store.push(exports.config.name, 'hello', true);
    console.log(pages);
    resolve();

    var parse_actions = pages.map((page) => {
      return new Promise((resolveParse) => {
        resolveParse();
        // if (is_object(page)) {
        //   page.evaluate(function(selector) {
        //     var result = [];
        //     var elems = document.querySelectorAll(selector);
        //     for (var i=0; i < elems.length; i++) {
        //       result.push(elems[i].innerHTML);
        //     }
        //     return result;
        //   }, selector).then(function(items) {
        //     exports.result_store.push(exports.config.name, items, true);
        //     resolveParse();
        //   });
        // } else if (is_string(page)) {
        //   var $ = cheerio.load(page);
        //   exports.result_store.push(exports.config.name, $(selector).attr('id'), true);
        //   resolveParse();
        // }
      });
    });

    // Promise.all(parse_actions).then(() => {
    //   resolve();
    //   // resolveSubactions(action.actions, resolveAction);
    // });
  });
};
