var Action = require('./Action'),
    ActionClickController = require('./ActionClickController'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),

    deepcopy = require('deepcopy');

function ActionPaginate() {
  ActionClickController.apply(this, Array.prototype.slice.call(arguments));
}

ActionPaginate.prototype = new ActionClickController();

ActionPaginate.prototype.main = function (subactions) {
  const ACTION = this,
        SLAVE_ACTION_TYPE = 'AClickOneElement',
        PAGINATION_LIMIT = 10;

  var pages = ACTION.get_from_store(ACTION.get_target());
  var visited = [];

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      ACTION.write_to_store(page);
      return new Promise(function(resolve) {
        var scanPaginationButtons = function() {
          var xpath_injection = new XPathInjection();
          xpath_injection.apply(page).then(function() {
            const selector = ACTION.config.data.selector;
            page.evaluate(function(selector) {
              var result = {};
              var elements = document.querySelectorAll(selector);
              for (var ei=0; ei<elements.length; ei++) {
                var xpel = window.__wpp__.xpath(elements[ei]);
                var obj = elements[ei];
                var name = obj.textContent ? obj.textContent : obj.innerText;
                result[name] = xpel;
              }

              return result;
            }, selector).then(function(buttons) {
              var found = false;
              for (var name in buttons) {
                if (name in visited) {
                  continue;
                }
                found = true;
                break;
              }

              if (!found) {
                ACTION.finalize().then(function(result) {
                  resolve(result);
                });
                return;
              }

              var click_config = deepcopy(ACTION.config);
              click_config.type = SLAVE_ACTION_TYPE;
              click_config.name = ACTION.config.name + ' (' + name + ')';
              click_config.data = {
                xpath: buttons[name]
              };

              var slave = ACTION.factory.create_action(click_config);
              slave.main(subactions).then(function() {
                visited.push(name);

                if (visited.length >= PAGINATION_LIMIT) {
                  ACTION.finalize().then(function(result) {
                    resolve(result);
                  });
                } else {
                  scanPaginationButtons();
                }
              });
            });
          });
        };

        scanPaginationButtons();
      });
    });

    Promise.all(actions).then(function(result) {
      resolveAllPages(result[0]);
    });
  });
};

module.exports = ActionPaginate;
