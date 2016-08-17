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
            var extactions = [];
            for (var index in buttons) {
              // Create ClickOneElement action
              var click_config = deepcopy(ACTION.config);
              click_config.name = ACTION.get_name() + ' (' + index + ')';
              click_config.type = 'AClickOneElement';
              click_config.data = {
                xpath: buttons[index]
              };
              var click = ACTION.factory.create_action(click_config, ACTION.store, ACTION.browser);

              // Create HistoryBack action
              // var history_back = ACTION.factory.create_action({
              //   name: 'back',
              //   type: 'AHistoryBack',
              //   target: click_config.target
              // }, ACTION.store, ACTION.browser);

              // var relactions = [];
              // var indactions = [];
              // for (var subaction of subactions) {
              //   if (subaction.config.target == ACTION.get_name()) {
              //     var sa_config_clone = deepcopy(subaction.config);
              //     sa_config_clone.target = click_config.name;

              //     var subaction_clone = ACTION.factory.create_action(sa_config_clone, ACTION.store, ACTION.browser);
              //     relactions.push(subaction_clone);
              //   } else {
              //     indactions.push(subaction);
              //   }
              // }

              // extactions.unshift(history_back);
              // extactions.unshift.apply(extactions, indactions);
              // extactions.unshift.apply(extactions, relactions);
              // extactions.unshift(click);
            }

            console.log();
            console.log(ACTION.config.name + ':');
            for (var extaction of extactions) {
              console.log(extaction.config.name, '->', extaction.config.target);
            }

            resolve();
            // ACTION.run_subactions(extactions).then(function(result) {
            //   resolve(result);
            // });

            // var head = buttons[0];
            // var tail = buttons.splice(1, buttons.length);

            // click.main().then(function(result) {

            // });

            // for (var button in buttons) {
            //   click.config.data.xpath = button;
            //   click.main().then(function(result) {
            //     console.log(result);
            //   });
            //   break;
            // }

            // Вызываем отсюда клик по каждому элементу
            // console.log(buttons);
            // resolve();
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

// {
//   ACTION.push_to_store(page);

//   var dependent_actions = [];
//   for(var subaction of subactions) {
//     if (subaction.config.target == ACTION.get_name()) {
//       dependent_actions.push(subaction);
//     }
//   }

//   console.log('EXPLODE ACTION:', ACTION.get_name());
//   var click_actions = Object.keys(click_element).map(function(path) {
//     // for each click_element create action and push into stack
//     var new_action = ACTION.create_new_click_action(path);

//     var cloned_children = [];
//     for(var daction of dependent_actions) {
//       // TODO change target to click[0], etc
//       var sclone_config = deepcopy(daction.config);
//       sclone_config.target = new_action.get_name();
//       sclone_config.name = daction.get_name() + '__' + new_action.get_name();

//       var sclone = ACTION.factory.create_action(sclone_config, ACTION.store, ACTION.browser);
//       cloned_children.push(sclone);
//     }

//     for (var clone_child of cloned_children) {
//       subactions.unshift(clone_child);
//     }

//     subactions.unshift(new_action);
//   });

//   Promise.all(click_actions).then(function(result) {
//     var remove_indexes = [];
//     for (var si in subactions) {
//       if (subactions[si].config.target == ACTION.get_name()) {
//         remove_indexes.push(si);
//       }
//     }
//     for (var ri of remove_indexes) {
//       subactions.splice(ri, 1);
//     }

//     ACTION.run_subactions(subactions).then(function(result) {
//       resolve(result);
//     });
//   });
// }
