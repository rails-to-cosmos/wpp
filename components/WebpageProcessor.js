"use strict";

var phantom = require("phantom"),

    ActionFactory = require('./ActionFactory'),
    ActionResultStore = require('./stores/ActionResultStore'),

    is_array = require('./utils').is_array;


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

  this.data = tree;
}

function GarbageCollector(data_storage) {
  this.data_storage = data_storage;
}

GarbageCollector.prototype.collect = function() {
  var data = this.data_storage.get_data();

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      var result_list = data[key];
      result_list.forEach(function(element) {
        if(element.hasOwnProperty('__collected__'))
          return;

        switch (element.constructor.name) {
        case 'Page':
          element.__collected__ = true;
          element.close();
          break;
        }
      });
    }
  }
};

function WebpageProcessor() {

}

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
        if (actions[action.config.name]) {
          WEBPAGE_PROCESSOR.resolve_actions(actions, action.config.name).then(function() {
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

  return new Promise(function(resolve, reject) {
    Promise.all(promises).then(() => {
      resolve();
    });
  });
};

WebpageProcessor.prototype.resolve_action_tree = function(action_tree) {
  return this.resolve_actions(action_tree.data, '__main__');
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

        console.log('1');
        var result = result_store.get_visible_data();
        console.log('2');

        console.log(result);
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
