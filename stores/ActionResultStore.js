var CacheStore = require('./CacheStore');

var ActionResultStore = function() {
  CacheStore.apply(this, Array.prototype.slice.call(arguments));

  this.flags = {};
};

ActionResultStore.prototype.set_flag = function(key, flag, value) {
  if (!this.flags[key]) {
    this.flags[key] = {};
  }

  this.flags[key][flag] = value;
};

ActionResultStore.prototype.get_flag = function(key, flag) {
  return this.flags[key][flag];
};

ActionResultStore.prototype.push = function(key, value, visibility) {
  this.set_flag(key, 'visibility', visibility);
  return this.push(key, value);
};

ActionResultStore.prototype.get_visible_data = function() {
  var data = this.get_data();
  var visible_data = {};

  for (var key in data) {
    if (this.get_flag(key, 'visibility') === true) {
      visible_data[key] = data[key];
    }
  }

  return visible_data;
};

module.exports = ActionResultStore;
