"use strict";

var phantom = require("phantom"),

    ActionFactory = require('./ActionFactory'),
    ActionResultStore = require('./stores/ActionResultStore'),
    GarbageCollector = require('./utils/GarbageCollector'),
    ActionTree = require('./data_structures/ActionTree');


function WebpageProcessor() {

}

// resolve actions recursively
WebpageProcessor.prototype.resolve_actions = function(actions, key) {
  if (!actions[key]) {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  }

  console.log('Resolving subactions for ' + key);

  var WEBPAGE_PROCESSOR = this;
  let promises = actions[key].map(function(action) {
    return new Promise(function(resolve, reject) {
      action.main().then(function() {
        if (actions[action.get_name()]) {
          WEBPAGE_PROCESSOR.resolve_actions(actions, action.get_name()).then(function() {
            console.log('Resolved ' + action.get_name());
            resolve();
          });
        } else {
          console.log('Resolved ' + action.get_name());
          resolve();
        }
      });
    });
  });

  return new Promise(function(resolve, reject) {
    Promise.all(promises).then(() => {
      resolve();
    });
  });
};

WebpageProcessor.prototype.resolve_action_tree = function(action_tree) {
  return this.resolve_actions(action_tree.data, action_tree.root);
};

WebpageProcessor.prototype.process = function(config) {
  var WEBPAGE_PROCESSOR = this;
  var phantom_instance = null;

  return phantom.create().then((instance) => {
    console.log('');
    console.log('Hello.');

    phantom_instance = instance;

    var result_store = new ActionResultStore();
    var garbage_collector = new GarbageCollector(result_store);
    var action_factory = new ActionFactory();
    var action_tree = new ActionTree(config.actions, action_factory, result_store, phantom_instance);

    return new Promise((resolve, reject) => {
      WEBPAGE_PROCESSOR.resolve_action_tree(action_tree).then(() => {
        console.log('My watch has ended.');

        var result = result_store.get_visible_data();
        garbage_collector.collect();
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
