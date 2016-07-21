function ComplexSelector(selector) {
  this.selector = selector;
  this.flags = {
    outer_html: false
  };

  if (this.selector.indexOf('[outerHTML]') > -1) {
    this.flags.outer_html = true;
    this.selector = this.selector.replace('[outerHTML]', '');
  }
}

module.exports = ComplexSelector;
