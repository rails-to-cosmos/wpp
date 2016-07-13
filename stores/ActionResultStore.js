var oop = require('oop-module');
var _super = oop.extends('./CacheStore');


var flags = {};

var set_flag = function(key, flag, value) {
  if (!flags[key]) {
    flags[key] = {};
  }

  flags[key][flag] = value;
};

var get_flag = function(key, flag) {
  return flags[key][flag];
};

exports.push = (key, value, visibility) => {
  set_flag(key, 'visibility', visibility);
  return _super.push(key, value);
};

exports.get_visible_data = () => {
  var data = _super.get_data();
  var visible_data = {};

  for (var key in data) {
    if (get_flag(key, 'visibility') === true) {
      visible_data[key] = data[key];
    }
  }

  return visible_data;
};
