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

OuterHTMLRepresentation.prototype.repr = function() {
  return this.$(this.element).html();
};

function TextRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

TextRepresentation.prototype.repr = function() {
  return this.$(this.element).text();
};

function AttributeRepresentation() {
  ElementRepresentation.apply(this, Array.prototype.slice.call(arguments));
}

AttributeRepresentation.prototype.repr = function() {
  return this.$(this.element).attr(this.selector.attribute);
};

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

ActionParse.prototype.main = function() {
  var BROWSER = this.browser,
      CONFIG = this.config,
      STORE = this.store;

  return new Promise((resolve, reject) => {
    var selector = new ComplexSelector(CONFIG.data.selector);

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

    var pages = STORE.get(CONFIG.target);
    var parse_actions = pages.map((page) => {
      return new Promise((resolveParse) => {
        get_page_content(page).then((content) => {
          var result = [];
          var $ = cheerio.load(content);

          $(selector.selector).each((id, el) => {
            var er = new representation($, el, selector);
            result.push(er.repr());
          });

          STORE.push(CONFIG.name, result, true);

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
