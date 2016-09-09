'use strict';

var Action = require('./Action'),
    cheerio = require('cheerio'),
    get_page_content = require('../webpage/Utils').get_page_content,
    get_representation = require('../webpage/ElementRepresentations').get_representation;

function ComplexSelector(selector) {
  this.selector = '';
  this.attribute = '';
  this.index = -1;

  if (selector) {
    // get index from selector
    let eq_matches = selector.match(/:eq\((\d+)\)/);
    if (eq_matches && eq_matches.length > 1) {
      let index;

      try {
        this.index = parseInt(eq_matches[1]);
      } catch (exc) {
        // console.log('AttributeError: eq contains non-numeric value');
      }

      selector = selector.replace(/:eq\((\d+)\)/, '');
    }

    let sel_attr_list = selector.match(/(.*?)\[([a-zA-Z\-]+)\]/);
    if (sel_attr_list) {
      this.selector = sel_attr_list[1];
      this.attribute = sel_attr_list[2];
    } else {
      this.selector = selector;
    }
  }
}

function ActionParse() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionParse.prototype = new Action();

ActionParse.prototype.main = function(subactions) {
  var ACTION = this;

  Action.prototype.main.call(this, subactions);

  return new Promise(function(resolve, reject) {
    try {
      var selector = new ComplexSelector(ACTION.config.data.selector),
          Representation = get_representation(selector),
          pages = ACTION.get_from_store(ACTION.get_target());

      var parse_actions = pages.map(function(page) {
        return new Promise(function(resolveParse, rejectParse) {
          try {
            get_page_content(page, ACTION).then(function(content) {
              try {
                let result = [], element, element_representation,
                    $ = cheerio.load(content);

                if (selector.selector[0] == '>') {
                  let clean_selector = selector.selector.slice(1, selector.selector.length);
                  if (selector.index > -1) {
                    try {
                      element = $(selector.selector).get(selector.index);
                    } catch (exc) {
                      // console.log(exc);
                    }
                  } else {
                    element = $(clean_selector).first();
                  }

                  element_representation = new Representation($, element, selector);
                  result.push(element_representation.repr());
                } else if (selector.selector) {
                  if (selector.index > -1) {
                    try {
                      element = $(selector.selector).get(selector.index);
                    } catch (exc) {
                      // console.log(exc);
                    }

                    element_representation = new Representation($, element, selector);
                    result.push(element_representation.repr());
                  } else {
                    try {
                      $(selector.selector).each(function(id, el) {
                        element_representation = new Representation($, el, selector);
                        result.push(element_representation.repr());
                      });
                    } catch (exc) {
                      // console.log(exc);
                    }
                  }
                } else if (selector.attribute && !selector.selector) {
                  element = $(content);
                  element_representation = new Representation($, element, selector);
                  result.push(element_representation.repr());
                }

                ACTION.push_to_store(result);
                resolveParse();
              } catch (exc) {
                rejectParse(exc);
              }
            }, rejectParse);
          } catch (exc) {
            rejectParse(exc);
          }
        });
      });

      Promise.all(parse_actions).then(function() {
        ACTION.run_subactions(subactions).then(function(result) {
          resolve(result);
        }, reject);
      }, reject);
    } catch (exc) {
      reject(exc);
    }
  });
};

module.exports = ActionParse;
