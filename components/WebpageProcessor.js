var phantom = require('phantom'),
    is_array = require('./utils/TypeHints').is_array;

function WebpageProcessor() {

}

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  var action_stack = action_tree.as_stack();
  return this.process_action_stack(action_stack);
};

WebpageProcessor.prototype.process_action_stack = function(action_stack) {
  var head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  return head.main(tail);
};

module.exports = WebpageProcessor;
