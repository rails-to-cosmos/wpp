'use strict';

function ComplexSelector() {
  this.selector = '';
  this.attribute = '';
  this.index = -1;
}

ComplexSelector.prototype.build = function(selector) {
  let eq_matches = selector.match(/:eq\((\d+)\)/);

  if (eq_matches && eq_matches.length > 1) {
    this.index = parseInt(eq_matches[1]);
    selector = selector.replace(/:eq\((\d+)\)/, '');
  }

  let sel_attr_list = selector.match(/(.*?)\[([a-zA-Z\-]+)\]/);
  if (sel_attr_list) {
    this.selector = sel_attr_list[1];
    this.attribute = sel_attr_list[2];
  } else {
    this.selector = selector;
  }
};

module.exports = ComplexSelector;
