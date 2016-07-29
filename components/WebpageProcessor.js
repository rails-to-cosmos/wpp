"use strict";

var phantom = require('phantom'),
    is_array = require('./utils/TypeHints').is_array,

    ActionFactory = require('./ActionFactory'),
    ActionResultStore = require('./stores/ActionResultStore'),
    ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor() {
  this.result_store = new ActionResultStore();
  this.action_factory = new ActionFactory();
}

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  var action_stack = action_tree.as_stack();
  return this.process_action_stack(action_stack);
};

WebpageProcessor.prototype.grow_action_tree = function(config, browser) {
  var action_tree = new ActionTree(config.actions,
                                   this.action_factory,
                                   this.result_store,
                                   browser);
  return action_tree;
};

WebpageProcessor.prototype.process_action_stack = function(action_stack) {
  var head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  return head.main(tail);
};

module.exports = WebpageProcessor;
