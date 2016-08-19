function ElementRepresentation($, el, selector) {
  this.$ = $;
  this.element = el;
  this.selector = selector;
}

function OuterHTMLRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

OuterHTMLRepresentation.prototype = new ElementRepresentation();

OuterHTMLRepresentation.prototype.repr = function() {
  var element = this.$(this.element);
  return this.$.html(element);
};

function TextRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

TextRepresentation.prototype = new ElementRepresentation();

TextRepresentation.prototype.repr = function() {
  return this.$(this.element).text();
};

function AttributeRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

AttributeRepresentation.prototype = new ElementRepresentation();

AttributeRepresentation.prototype.repr = function() {
  return this.$(this.element).attr(this.selector.attribute);
};

function get_representation(selector) {
  var representation = TextRepresentation;
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
  get_representation: get_representation
};
