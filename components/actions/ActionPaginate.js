var Action = require('./Action'),
    ActionClickMaster = require('./ActionClickMaster'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),
    deepcopy = require('deepcopy');

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function ActionPaginate() {
  ActionClickMaster.apply(this, Array.prototype.slice.call(arguments));
}

ActionPaginate.prototype = new ActionClickMaster();

ActionPaginate.prototype.main = function (subactions) {
  const ACTION = this,
        SLAVE_ACTION_TYPE = 'AClickSlave',
        PAGINATION_LIMIT = 10;

  var pages = ACTION.get_from_store(ACTION.get_target());
  var visited = [];

  Action.prototype.main.call(this, subactions);

  return new Promise(function(resolveAllPages) {
    var dependent_subactions = [];
    var independent_subactions = [];
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
              if (Object.keys(buttons).length == 0) {
                ACTION.run_subactions(subactions).then(function(result) {
                  resolve(result);
                });
                return;
              }
              var found = false;
              for (var name in buttons) {
                if (visited.indexOf(name.hashCode()) > -1) {
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

              if (dependent_subactions.length == 0 && independent_subactions.length == 0) {
                for (var subaction of subactions) {
                  if (subaction.config.target == ACTION.config.name) {
                    dependent_subactions.push(subaction);
                  } else {
                    independent_subactions.push(subaction);
                  }
                }
              }

              var slave = ACTION.factory.create_action(click_config, ACTION);
              slave.main(dependent_subactions).then(function() {
                visited.push(name.hashCode());
                if (visited.length < PAGINATION_LIMIT) {
                  scanPaginationButtons();
                } else {
                  ACTION.finalize().then(function(result) {
                    resolve(result);
                  });
                }
              });
            });
          });
        };

        scanPaginationButtons();
      });
    });

    Promise.all(actions).then(function(result) {
      var isl = independent_subactions.length;
      if (isl > 0) {
        var iss = [];
        for (var is of independent_subactions) {
          iss.push(is.config.name);
        }
        independent_subactions[0].history = ACTION.history;
        independent_subactions[0].hd = ACTION.hd;
        independent_subactions[0].main(independent_subactions.slice(1, isl)).then(function(result) {
          resolveAllPages(result[0]);
        });
      } else { // nothing to do
        resolveAllPages(result[0]);
      }
    });
  });
};

module.exports = ActionPaginate;
