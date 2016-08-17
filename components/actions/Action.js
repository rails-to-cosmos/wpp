var is_array = require('../utils/TypeHints').is_array;

function Action(factory, config, store, browser) {
  this.factory = factory;
  this.config = config;
  this.store = store;
  this.browser = browser;
};

Action.prototype.get_browser = function() {
  return this.browser;
};

Action.prototype.get_from_store = function(value) {
  return this.store.get(value);
};

Action.prototype.push_to_store = function(value) {
  return this.store.push(this.get_name(), value, this.is_visible());
};

Action.prototype.get_name = function() {
  return this.config.name;
};

Action.prototype.get_target = function() {
  return this.config.target;
};

Action.prototype.is_visible = function() {
  return this.config.settings && this.config.settings.visible;
};

Action.prototype.run_subactions = function(subactions) {
  var ACTION = this;

  if (!is_array(subactions) || subactions.length == 0) {
    return new Promise(function(resolve, reject) {
      resolve(ACTION.store.get_visible_data());
    });
  }

  var clone = subactions.slice(),
      head = clone[0],
      tail = clone.slice().splice(1, clone.length);

  var acts = [];
  for (var act of tail) {
    acts.push(act.get_name());
  }

  console.log(head.get_name(), ' -> ', head.config.target);

  return head.main(tail);
};

Action.prototype.main = function(subactions) {

};

module.exports = Action;
