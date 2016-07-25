var CacheStore = require('./CacheStore');

var ActionResultStore = function() {
  CacheStore.apply(this, Array.prototype.slice.call(arguments));

  this.flags = {};
  this.garbage = {};
};

ActionResultStore.prototype = new CacheStore();

ActionResultStore.prototype.set_flag = function(key, flag, value) {
  if (!this.flags[key]) {
    this.flags[key] = {};
  }

  this.flags[key][flag] = value;
};

ActionResultStore.prototype.get_flag = function(key, flag) {
  return this.flags[key][flag];
};

ActionResultStore.prototype.get = function(key) {
  return CacheStore.prototype.get.call(this, key);
};

ActionResultStore.prototype.push = function(key, value, visibility) {
  this.set_flag(key, 'visibility', visibility);
  var result = CacheStore.prototype.push.call(this, key, value);
  return result;
};

ActionResultStore.prototype.get_visible_data = function() {
  var data = CacheStore.prototype.get_data.call(this);
  var visible_data = {};
  for (var key in data) {
    var filtered_data = [];

    if (this.get_flag(key, 'visibility') === true) {
      data[key].forEach(function(element) {
        switch(element.constructor.name) {
        case 'Page':
          filtered_data.push('<Page object>');
          break;
        default:
          filtered_data.push(element);
        }
      });
      visible_data[key] = filtered_data;
    }
  }

  return visible_data;
};

module.exports = ActionResultStore;
