function Action(config, store, browser) {
  this.config = config;
  this.store = store;
  this.browser = browser;
  this.async = true;
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

Action.prototype.main = function* () {

};

module.exports = Action;
