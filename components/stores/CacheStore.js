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

CacheStore.prototype.write = function(key, value, flags) {
  if (!is_array(value)) {
    value = [value];
  }

  this.data[key] = value;
};

CacheStore.prototype.get = function(key) {
  return this.data[key] || [];
};

CacheStore.prototype.get_data = function() {
  return this.data;
};

CacheStore.prototype.free = function() {
  for (var key in this.data) {
    // console.log(delete this.data[key]);
  }
};

module.exports = CacheStore;
