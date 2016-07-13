var is_array = require('../utils').is_array;
var data = {};

exports.constructor = function() {

};

exports.push = function(key, value, flags) {
  if( !is_array(value) ) {
    value = [value];
  }

  if (data[key]) {
    data[key].push.apply(data[key], value);
  } else {
    data[key] = value;
  }
};

exports.get = function(key) {
  return data[key];
};

exports.get_data = function() {
  return data;
};
