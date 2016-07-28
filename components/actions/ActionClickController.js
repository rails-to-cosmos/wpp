var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection');


function ActionClickController() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickController.prototype = new Action();

ActionClickController.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionClickController.prototype.main = function (subactions) {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  var ACTION = this;

  var pages = ACTION.get_from_store(ACTION.get_target());
  var clickons = {};

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolve) {
        // Get elements for Click
        // For each spawn OneElementClick action
        // Add spawned actions to subactions stack

        var xpath_module = new XPathInjection();
        xpath_module.apply(page).then(function() {
          page.evaluate(function(selector) {
            var result = {};
            var elements = document.querySelectorAll(selector);
            for (var ei=0; ei<elements.length; ei++) {
              var xpel = window.__wpp__.xpath(elements[ei]);
              if (result[xpel]) {
                result[xpel]++;
              } else {
                result[xpel] = 1;
              }
            }

            return result;
          }, ACTION.get_selector()).then(function(result) {
            console.log('heyhou', result);
            // clickons[page.target] = new Set();
            // for (var clickon in result) {
            //   clickons[page.target].add(clickon);
            // }
            // console.log(clickons);

            ACTION.push_to_store(page);
            ACTION.run_subactions(subactions).then(function(result) {
              resolve(result);
            });
          });
        });

        // if (page.injectJs(XPATH_INJECTION)) {
        //   page.evaluate(function() {
        //     return window.__test__;
        //   }).then(function(result) {
        //     console.log('111', result);
        //   });
        // }
      });
    });

    Promise.all(actions).then(function(result) {
      // Get only first result
      // To avoid duplicate pointer to datastorage in result
      resolveAllPages(result[0]);
    });
  });

};

module.exports = ActionClickController;
