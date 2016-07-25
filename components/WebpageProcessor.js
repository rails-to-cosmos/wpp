"use strict";

var phantom = require("phantom"),

    ActionFactory = require('./ActionFactory'),
    ActionResultStore = require('../stores/ActionResultStore'),

    is_array = require('../utils').is_array;

function ActionTree(actions, factory, store, browser) {
  var tree = {
    __main__: []
  };

  for (var action_index in actions) {
    var action_config = actions[action_index];
    var action = factory.create_action(action_config, store, browser);
    if (action_config.target) {
      if (!tree[action_config.target]) {
        tree[action_config.target] = [];
      }
      tree[action_config.target].push(action);
    } else {
      tree.__main__.push(action);
    }
  }

  this.tree = tree;
}

ActionTree.prototype.resolve = function (actions, key) {
  key = key || '__main__';
  actions = actions || this.tree;

  if (!actions[key]) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  }

  // console.log('Resolving subactions for ' + key);

  var ACTION_TREE = this;
  let promises = actions[key].map((action) => {
    return new Promise(function(resolve, reject) {
      action.main().then(function() {
        if (actions[action.config.name]) {
          ACTION_TREE.resolve(actions, action.config.name).then(() => {
            // console.log('Resolved ' + action.config.name);
            resolve();
          });
        } else {
          // console.log('Resolved ' + action.config.name);
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


function WebpageProcessor() {

}

WebpageProcessor.prototype.process = function(config) {
  var phantom_instance = null;
  return phantom.create().then((instance) => {
    console.log('');
    console.log('Hello.');

    phantom_instance = instance;

    var result_store = new ActionResultStore();
    var action_factory = new ActionFactory();
    var action_tree = new ActionTree(config.actions, action_factory, result_store, phantom_instance);

    return new Promise((resolve, reject) => {
      action_tree.resolve().then(() => {
        console.log('My watch has ended.');
        var result = result_store.get_visible_data();
        console.log(result);
        phantom_instance.exit();
        resolve(result);
        console.log('Bye.\n');
      });
    });
  }).catch(error => {
    console.log(error);
    phantom_instance.exit();
  });
};


module.exports = WebpageProcessor;
