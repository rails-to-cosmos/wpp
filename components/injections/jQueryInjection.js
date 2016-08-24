var Injection = require('./Injection');

var jQueryInjection = function() {

};

jQueryInjection.prototype = new Injection();

jQueryInjection.prototype.code = function() {
  if (typeof __wpp__ == 'undefined') {
    __wpp__ = {};
  }

  if (!__wpp__.jquery) {
    __wpp__.jquery = 1;
  } else {
    return;
  }
};

module.exports = jQueryInjection;
