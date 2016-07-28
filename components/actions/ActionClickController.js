var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),

    deepcopy = require('deepcopy');

function ActionClickController() {
  Action.apply(this, Array.prototype.slice.call(arguments));

  this.spawned_actions = [];
}

ActionClickController.prototype = new Action();

ActionClickController.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionClickController.prototype.create_new_click_action = function(selector) {
  var ACTION = this;

  var new_config = deepcopy(this.config);
  delete new_config.data.selector;
  new_config.data.xpath = selector;
  new_config.name = ACTION.get_name() + '[' + ACTION.spawned_actions.length + ']';
  new_config.type = 'AClickOneElement';

  var new_action = this.factory.create_action(new_config, this.store, this.browser);

  this.spawned_actions.push(new_action);
  return new_action;
};

ActionClickController.prototype.main = function (subactions) {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  var ACTION = this;

  var pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolve) {
        // Get elements for Click
        // For each one spawn OneElementClick action
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
          }, ACTION.get_selector()).then(function(clickon) {
            ACTION.push_to_store(page);

            var dependent_actions = [];
            for(var subaction of subactions) {
              if (subaction.config.target == ACTION.get_name()) {
                dependent_actions.push(subaction);
              }
            }

            var clickons = Object.keys(clickon).map(function(path) {
              // for each clickon create action and push into stack
              var new_action = ACTION.create_new_click_action(path);

              var sclones = [];
              for(var daction of dependent_actions) {
                // TODO change target to click[0], etc
                var sclone_config = deepcopy(daction.config);
                sclone_config.target = new_action.get_name();
                sclone_config.name = daction.get_name() + '__' + new_action.get_name();

                var sclone = ACTION.factory.create_action(sclone_config, ACTION.store, ACTION.browser);
                sclones.push(sclone);
              }

              for (var repeat_action of sclones) {
                subactions.unshift(repeat_action);
              }

              subactions.unshift(new_action);
            });

            Promise.all(clickons).then(function(result) {
              var remove_indexes = [];
              for (var si in subactions) {
                if (subactions[si].config.target == ACTION.get_name()) {
                  remove_indexes.push(si);
                }
              }
              for (var ri of remove_indexes) {
                subactions.splice(ri, 1);
              }

              ACTION.run_subactions(subactions).then(function(result) {
                resolve(result);
              });
            });
          });
        });
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
