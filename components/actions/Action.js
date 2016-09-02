var is_array = require('../utils/TypeHints').is_array;

function Action(factory, config, store, browser) {
  this.factory = factory;
  this.config = config;
  this.store = store;
  this.browser = browser;
  this.history = new Map();
};

Action.prototype.get_browser = function() {
  return this.browser;
};

Action.prototype.get_from_store = function(value) {
  return this.store.get(value);
};

Action.prototype.write_to_store = function(value) {
  return this.store.write(this.get_name(), value, this.is_visible());
};

Action.prototype.push_to_store = function(value) {
  return this.store.push(this.get_name(), value, this.is_visible());
};

Action.prototype.get_name = function() {
  return this.config.name.replace(/\r?\n|\r/g, '').replace(/\s/g, '');
};

Action.prototype.get_target = function() {
  return this.config.target;
};

Action.prototype.is_visible = function() {
  return this.config.settings && this.config.settings.visible;
};

Action.prototype.finalize = function() {
  var ACTION = this;

  return new Promise(function(resolve, reject) {
    resolve({
      data: ACTION.store.get_visible_data(),
      history: ACTION.history
    });
  });
};

Action.prototype.run_subactions = function(subactions) {
  var ACTION = this;

  if (!is_array(subactions) || subactions.length == 0) {
     return ACTION.finalize();
  }

  var clone = subactions.slice(),
      head = clone[0],
      tail = clone.slice().splice(1, clone.length);

  console.log(ACTION.get_name(), '==>', head.get_name(), '->', head.config.target);
  head.history = this.history;
  return head.main(tail);
};

Action.prototype.main = function(subactions) {
  this.history.set(this.get_name(), this);
};

module.exports = Action;
