"use strict";

var phantom = require('phantom'),
    is_array = require('./utils/TypeHints').is_array,

    ActionFactory = require('./ActionFactory'),
    ActionResultStore = require('./stores/ActionResultStore'),
    GarbageCollector = require('./utils/GarbageCollector'),
    ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor() {
  this.result_store = new ActionResultStore();
  this.garbage_collector = new GarbageCollector(this.result_store);
  this.action_factory = new ActionFactory();
}

WebpageProcessor.prototype.process_action_stack = function(action_stack) {
  // if (!is_array(action_stack) || action_stack.length == 0) {
  //   return new Promise(function(resolve, reject) {
  //     resolve({
  //       hello: 'there'
  //     });
  //   });
  // }

  var head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  return head.main(tail);

  // this.process_action_stack(args);
  // var action = action_tree.get_action(action_name);
};

WebpageProcessor.prototype.grow_action_tree = function(config, browser) {
  var action_tree = new ActionTree(config.actions,
                                   this.action_factory,
                                   this.result_store,
                                   browser);
  return action_tree;
};

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  var action_stack = action_tree.as_stack();
  return this.process_action_stack(action_stack);

  // var WEBPAGE_PROCESSOR = this;
  // let promises = actions[key].map(function(action) {
  //   return new Promise(function(resolve, reject) {
  //     for (var action_result of action.main()) {
  //       console.log(1);
  //       // var resolve_action = function() {
  //       //   console.log('Resolved ' + action.get_name());
  //       //   if (actions[action.get_name()]) {
  //       //     WEBPAGE_PROCESSOR.resolve_actions(actions, action.get_name()).then(resolve);
  //       //   } else {
  //       //     resolve();
  //       //   }
  //       // };

  //       // if (action.async) {
  //       //   action_result.then(resolve_action);
  //       // } else { // wait for action resolve
  //       //   action_result.then(resolve_action);
  //       // }
  //     }
  //     resolve();
  //   });
  // });

  // return new Promise(function(resolve, reject) {
  //   Promise.all(promises).then(function() {
  //     resolve();
  //   });
  // });
};

// WebpageProcessor.prototype.process_config = function(config) {
//   var WPP = this;

//   return phantom.create().then((instance) => {
//     browser = instance;

//     var action_tree = WPP.grow_action_tree(config, browser);

//     return new Promise((resolve, reject) => {
//       WPP.process_tree(action_tree).then(function() {
//         console.log('My watch has ended.');

//         var result = WPP.result_store.get_visible_data();
//         WPP.garbage_collector.collect();
//         browser.exit();
//         resolve(result);

//         console.log('Bye.\n');
//       });
//     });
//   }).catch(error => {
//     console.log(error);
//     browser.exit();
//   });
// };


module.exports = WebpageProcessor;
