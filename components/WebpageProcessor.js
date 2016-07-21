"use strict";

var phantom = require("phantom"),

    ActionFactory = require('./ActionFactory'),
    ActionResultStore = require('../stores/ActionResultStore'),

    is_array = require('../utils').is_array;

var group_actions = (actions, action_factory, result_store, browser) => {
  var groupped_actions = {
    __main__: []
  };

  for (var action_index in actions) {
    var action_config = actions[action_index];
    var action = action_factory.create_action(action_config, result_store, browser);
    if (action_config.target) {
      if (!groupped_actions[action_config.target]) {
        groupped_actions[action_config.target] = [];
      }
      groupped_actions[action_config.target].push(action);
    } else {
      groupped_actions.__main__.push(action);
    }
  }

  return groupped_actions;
};

var resolve_actions = (actions, key) => {
  console.log(actions, key);

  key = key || '__main__';

  if (!actions[key]) {
    return new Promise((resolve, reject) => resolve());
  }

  console.log('Resolving subactions for ' + key);
  let promises = actions[key].map((action) => {
    return new Promise((resolve, reject) => {
      action.main().then(() => {
        console.log('1');
        if (actions[action.config.name]) {
          console.log('2');
          resolve_actions(actions, action.config.name).then(() => {
            console.log('Resolved ' + action.config.name);
            resolve();
          });
        } else {
          console.log('Resolved ' + action.config.name);
          resolve();
        }
      });
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all(promises).then(() => {
      resolve();
    });
  });
};


exports.process = (config) => {
  return phantom.create().then((browser) => {
    console.log('');
    console.log('Hello.');

    var result_store = new ActionResultStore();
    var action_factory = new ActionFactory();
    var actions = group_actions(config.actions, action_factory, result_store, browser); // ?

    return new Promise((resolve, reject) => {
      resolve_actions(actions).then(() => {
        console.log('My watch has ended.');
        var result = result_store.get_visible_data();
        console.log(result);
        browser.exit();
        console.log('Bye.\n');
        resolve(result);
      });
    });
  }).catch(error => {
    console.log(error);
  });
};
