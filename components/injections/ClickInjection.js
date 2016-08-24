var Injection = require('./Injection');

var ClickInjection = function() {

};

ClickInjection.prototype = new Injection();

ClickInjection.prototype.code = function() {
  if (typeof __wpp__ == 'undefined') {
    __wpp__ = {};
  }

  if (!__wpp__.click) {
    __wpp__.click = function(el) {
      var mouse_event = document.createEvent('MouseEvents');
      mouse_event.initMouseEvent('click', true, true, window,
                                 0, 0, 0, 0, 0,
                                 false, false, false, false,
                                 0, null);
      el.dispatchEvent(mouse_event);
    };
  }
};



module.exports = ClickInjection;
