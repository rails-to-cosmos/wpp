var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),
    deepcopy = require('deepcopy');

function ActionClickController() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickController.prototype = new Action();

ActionClickController.prototype.main = function (subactions) {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  const ACTION = this;

  var pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolve) {
        // Get elements for Click
        // For each spawn OneElementClick action
        // Add spawned actions to subactions stack

        var xpath_injection = new XPathInjection();
        xpath_injection.apply(page).then(function() {
          const selector = ACTION.config.data.selector;
          page.evaluate(function(selector) {
            var result = [];
            var elements = document.querySelectorAll(selector);
            for (var ei=0; ei<elements.length; ei++) {
              var xpel = window.__wpp__.xpath(elements[ei]);
              result.push(xpel);
            }

            return result;
          }, selector).then(function(buttons) {

            var createSlaves = function() {
              var slaves = [];
              for (var index in buttons) {
                // Create ClickOneElement action
                var click_config = deepcopy(ACTION.config);
                click_config.type = 'AClickOneElement';
                click_config.name = ACTION.config.name + ' (' + index + ')';
                click_config.data = {
                  xpath: buttons[index]
                };
                slaves.push(ACTION.factory.create_action(click_config, ACTION.store, ACTION.browser));
              }
              return slaves;
            };

            var processSlaves = function(slaves) {
              return new Promise(function(resolveSlave, rejectSlave) {
                console.log('Processing', slaves.length, 'slaves of master', ACTION.config.name);
                if (slaves.length == 0) {
                  resolveSlave();
                  return;
                }

                var slave_action = slaves.pop();
                slave_action.main(subactions).then(function() {
                  processSlaves(slaves).then(resolveSlave);
                });
              });
            };

            processSlaves(createSlaves()).then(function() {
              subactions = [];
              resolve();
            });
          });
        });
      });
    });

    Promise.all(actions).then(function(result) {
      // Get only first result
      // To avoid duplicate pointer to datastorage in result
      resolveAllPages(result);
    });
  });

};

module.exports = ActionClickController;
