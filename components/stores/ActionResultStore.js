var is_array = require('../utils/TypeHints').is_array;

var CacheStore = require('./CacheStore');
var ExtendedActionResults = require('../data_structures/ExtendedActionResults');


var ActionResultStore = function() {
  CacheStore.apply(this, Array.prototype.slice.call(arguments));

  this.flags = {};
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

ActionResultStore.prototype.push = function(key, value, visibility, repr) {
  this.set_flag(key, 'visibility', visibility);
  var result = CacheStore.prototype.push.call(this, key, value);
  return result;
};

ActionResultStore.prototype.write = function(key, value, visibility, repr) {
  this.set_flag(key, 'visibility', visibility);
  var result = CacheStore.prototype.write.call(this, key, value);
  return result;
};

ActionResultStore.prototype.get_visible_data = function() {
  var data = CacheStore.prototype.get_data.call(this);
  var visible_data = {};

  for (var key in data) {
    var filtered_data = [];

    if (this.get_flag(key, 'visibility') === true) {
      for (var element of data[key]) {
        if (element.constructor.name in ExtendedActionResults) {
          filtered_data.push(ExtendedActionResults[element.constructor.name].repr);
        } else {
          filtered_data.push(element);
        }
      }
      visible_data[key] = filtered_data;
    }
  }

  return visible_data;
};

module.exports = ActionResultStore;
