var Action = require('./Action'),
    cheerio = require('cheerio'),
    get_page_content = require('../webpage/Utils').get_page_content,
    get_representation = require('../webpage/ElementRepresentations').get_representation;

function ComplexSelector(selector) {
  this.selector = '';
  this.attribute = '';

  if (!selector) {
    return;
  }

  this.selector = selector;

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

ActionParse.prototype.main = function(subactions) {
  var ACTION = this;

  return new Promise(function(resolve, reject) {
    var selector = new ComplexSelector(ACTION.config.data.selector);
    var representation = get_representation(selector);
    var pages = ACTION.get_from_store(ACTION.get_target());

    var parse_actions = pages.map(function(page) {
      return new Promise(function(resolveParse) {
        get_page_content(page).then(function(content) {
          var result = [];
          var $ = cheerio.load(content);

          if (selector.selector) {
            $(selector.selector).each(function(id, el) {
              var er = new representation($, el, selector);
              result.push(er.repr());
            });
          } else if (selector.attribute) {
            var el = $(content);
            var er = new representation($, el, selector);
            result.push(er.repr());
          }

          ACTION.push_to_store(result);

          resolveParse();
        });
      });
    });

    Promise.all(parse_actions).then(function() {
      ACTION.run_subactions(subactions).then(function(result) {
        resolve(result);
      });
    });
  });
};

module.exports = ActionParse;
