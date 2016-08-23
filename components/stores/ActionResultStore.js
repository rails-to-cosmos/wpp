var is_array = require('../utils/TypeHints').is_array;

var CacheStore = require('./CacheStore');
var ExtendedActionResults = require('../data_structures/ExtendedActionResults');


var ActionResultStore = function() {
  CacheStore.apply(this, Array.prototype.slice.call(arguments));

  this.flags = {};

  console.log('Create ActionResultStore instance.');
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
  var groupped_data = [];

  for (var key in data) {
    var filtered_data = [];

    if (this.get_flag(key, 'visibility') === true) {
      for (var elindex in data[key]) {
        var element = data[key][elindex];
        var elres = element;
        if (element.constructor.name in ExtendedActionResults) {
          elres = ExtendedActionResults[element.constructor.name].repr(element);
        }

        if (groupped_data[elindex]) {
          groupped_data[elindex][key] = elres;
        } else {
          var newitem = {};
          newitem[key] = elres;
          groupped_data.push(newitem);
        }
      }
    }
  }

  return groupped_data;
};

module.exports = ActionResultStore;
