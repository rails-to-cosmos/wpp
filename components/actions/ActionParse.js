var Action = require('./Action'),
    cheerio = require('cheerio'),
    is_object = require('../../utils').is_object,
    is_string = require('../../utils').is_string;

function get_page_content(page) {
  return new Promise((resolve, reject) => {
    if (is_object(page)) {
      page.property('content').then((content) => {
        resolve(content);
      });
    } else if (is_string(page)) {
      resolve(page);
    } else {
      resolve('');
    }
  });
}

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
  return this.$(this.element).html();
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
    default:
      representation = AttributeRepresentation;
    }
  }

  return representation;
}

function ComplexSelector(selector) {
  this.selector = selector;
  this.attribute = '';

  var sel_attr_list = selector.match(/(.*?)\[([a-zA-Z\-]+)\]/);
  if (sel_attr_list) {
    this.selector = sel_attr_list[1];
    this.attribute = sel_attr_list[2];
  }
}

function ActionParse() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionParse.prototype = new Action();

ActionParse.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionParse.prototype.main = function() {
  var ACTION = this;

  return new Promise((resolve, reject) => {
    var selector = new ComplexSelector(ACTION.get_selector());
    var representation = get_representation(selector);
    var pages = ACTION.get_from_store(ACTION.get_target());
    var parse_actions = pages.map((page) => {
      return new Promise((resolveParse) => {
        get_page_content(page).then((content) => {
          var result = [];
          var $ = cheerio.load(content);

          $(selector.selector).each((id, el) => {
            var er = new representation($, el, selector);
            result.push(er.repr());
          });

          ACTION.push_to_store(result);
          resolveParse();
        });
      });
    });

    Promise.all(parse_actions).then(() => {
      resolve();
    });
  });
};

module.exports = ActionParse;
