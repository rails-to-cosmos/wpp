var is_array = require('../utils/TypeHints').is_array;

function CacheStore() {
  this.data = {};
}

CacheStore.prototype.push = function(key, value, flags) {
  if (!is_array(value)) {
    value = [value];
  }

  if (this.data[key]) {
    this.data[key].push.apply(this.data[key], value);
  } else {
    this.data[key] = value;
  }
};

CacheStore.prototype.get = function(key) {
  return this.data[key] || [];
};

CacheStore.prototype.get_data = function() {
  return this.data;
};

module.exports = CacheStore;
