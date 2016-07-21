var is_object = (obj) => Object.prototype.toString.call(obj) == '[object Object]';
var is_string = (obj) => Object.prototype.toString.call(obj) == '[object String]';
var is_array = (obj) => Object.prototype.toString.call(obj) == '[object Array]';

module.exports = {
  is_array: is_array,
  is_object: is_object,
  is_string: is_string
};
