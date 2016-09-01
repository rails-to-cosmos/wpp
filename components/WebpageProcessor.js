var phantom = require('phantom'),
    is_array = require('./utils/TypeHints').is_array,
    memwatch = require('memwatch-next');

function WebpageProcessor(hd) {
  this.hd = hd;
}

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  var action_stack = action_tree.as_stack();
  return this.process_action_stack(action_stack);
};

WebpageProcessor.prototype.process_action_stack = function(action_stack) {
  var head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  head.hd = this.hd;
  return head.main(tail);
};

module.exports = WebpageProcessor;
