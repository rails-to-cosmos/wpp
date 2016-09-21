'use strict';

function ElementRepresentation($, el, selector) {
  this.$ = $;
  this.element = el;
  this.selector = selector;
}

ElementRepresentation.prototype.exclude_rubbish = function(elem) {
  for (let excl of this.selector.excludes) {
    elem.children(excl).remove();
  }
};


function OuterHTMLRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

OuterHTMLRepresentation.prototype = new ElementRepresentation();

OuterHTMLRepresentation.prototype.repr = function() {
  let elem = this.$(this.element);
  this.exclude_rubbish(elem);
  return this.$.html(elem);
};


function TextRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

TextRepresentation.prototype = new ElementRepresentation();

TextRepresentation.prototype.repr = function() {
  let elem = this.$(this.element);
  this.exclude_rubbish(elem);
  return elem.text();
};


function AttributeRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

AttributeRepresentation.prototype = new ElementRepresentation();

AttributeRepresentation.prototype.repr = function() {
  let elem = this.$(this.element);
  this.exclude_rubbish(elem);
  return elem.attr(this.selector.attribute);
};


function get_representation_by_selector(selector) {
  let representation = TextRepresentation;
  if (selector.attribute) {
    switch(selector.attribute) {
    case 'outerHTML':
      representation = OuterHTMLRepresentation;
      break;
    case 'text':
      representation = TextRepresentation;
      break;
    default:
      representation = AttributeRepresentation;
    }
  }

  return representation;
}

module.exports = {
  get_representation_by_selector: get_representation_by_selector,

  ElementRepresentation: ElementRepresentation,
  OuterHTMLRepresentation: OuterHTMLRepresentation,
  TextRepresentation: TextRepresentation,
  AttributeRepresentation: AttributeRepresentation
};
