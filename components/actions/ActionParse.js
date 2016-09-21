'use strict';

const Action = require('./Action'),
      ComplexSelector = require('../webpage/ComplexSelector'),
      DataCleaner = require('../webpage/DataCleaner'),
      cheerio = require('cheerio'),
      get_page_content = require('../webpage/Utils').get_page_content,
      get_representation = require('../webpage/ElementRepresentations').get_representation;

const ACTION_PARSE_EXCEPTION = 'Parse action raised an exception:',
      CPX_SELECTOR_EXCEPTION = 'Complex selector raised an exception:';

function ActionParse() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionParse.prototype = new Action();

ActionParse.prototype.main = function(subactions) {
  let ACTION = this;

  Action.prototype.main.call(this, subactions);

  return new Promise(function(resolve, reject) {
    try {
      let selector = new ComplexSelector();
      try {
        selector.build(ACTION.config.data.selector);
      } catch (exc) {
        ACTION.logger.error(CPX_SELECTOR_EXCEPTION, exc);
      }

      let Representation = get_representation(selector),
          pages = ACTION.get_from_store(ACTION.get_target());

      let parse_actions = pages.map(function(page) {
        return new Promise(function(resolveParse, rejectParse) {
          try {
            get_page_content(page, ACTION).then(function(content) {
              try {
                let result = [], element, element_representation,
                    $ = cheerio.load(content),

                    get_element_by_selector = function(selector) {
                      let result;
                      try {
                        result = $(selector.selector).get(selector.index);
                      } catch (exc) {
                        ACTION.logger.error(ACTION_PARSE_EXCEPTION, exc);
                      }
                      return result;
                    },

                    clear_element_data = function(element_data) {
                      let dc = new DataCleaner();
                      return dc.clean(element_data);
                    },

                    get_element_data = function(element, selector) {
                      element_representation = new Representation($, element, selector);
                      return clear_element_data(element_representation.repr());
                    };

                if (selector.selector[0] == '>') {
                  let clean_selector = selector.selector.slice(1, selector.selector.length);
                  if (selector.index > -1) {
                    element = get_element_by_selector(selector);
                  } else {
                    element = $(clean_selector).first();
                  }

                  let element_data = get_element_data(element, selector);
                  result.push(element_data);
                } else if (selector.selector) {
                  if (selector.index > -1) {
                    element = get_element_by_selector(selector);
                    let element_data = get_element_data(element, selector);
                    result.push(element_data);
                  } else {
                    try {
                      $(selector.selector).each(function(id, el) {
                        let element_data = get_element_data(el, selector);
                        result.push(element_data);
                      });
                    } catch (exc) {
                      ACTION.logger.error(ACTION_PARSE_EXCEPTION, exc);
                    }
                  }
                } else if (selector.attribute && !selector.selector) {
                  element = $(content);
                  let element_data = get_element_data(element, selector);
                  result.push(element_data);
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
