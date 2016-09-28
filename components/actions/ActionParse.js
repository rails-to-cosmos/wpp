'use strict';

const Action = require('./Action'),
      ComplexSelector = require('../webpage/ComplexSelector'),
      DataCleaner = require('../webpage/DataCleaner'),
      cheerio = require('cheerio'),
      get_page_content = require('../webpage/Utils').get_page_content,
      get_representation_by_selector = require('../webpage/ElementRepresentations').get_representation_by_selector;

const ACTION_PARSE_EXCEPTION = 'Parse action raised an exception:',
      CPX_SELECTOR_EXCEPTION = 'Complex selector raised an exception:';

function ActionParse() {
    Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionParse.prototype = new Action();

ActionParse.prototype.build_selector = function(_sel) {
    let selector = new ComplexSelector();
    selector.build(_sel);
    return selector;
};

ActionParse.prototype.get_element_by_complex_selector = function($, selector) {
    let result;
    try {
        result = $(selector.selector).get(selector.index);
    } catch (exc) {
        ACTION.logger.error(ACTION_PARSE_EXCEPTION, exc);
    }
    return result;
};

ActionParse.prototype.clean_element_data = function(element_data) {
    let dc = new DataCleaner();
    return dc.clean(element_data);
};

ActionParse.prototype.get_element_data = function($, element, selector) {
    let Representation = get_representation_by_selector(selector),
        element_representation = new Representation($, element, selector);
    return element_representation.repr();
};

ActionParse.prototype.get_relative_element_data = function($, selector) {
    let element;
    if (selector.index > -1) {
        element = this.get_element_by_complex_selector($, selector);
    } else {
        let clean_selector = selector.selector.slice(1, selector.selector.length);
        element = $(clean_selector).first();
    }

    let element_data = this.get_element_data($, element, selector);
    element_data = this.clean_element_data(element_data);
    return element_data;
};

ActionParse.prototype.get_many_elements_by_cpx_selector = function($, selector) {
    let result = [],
        ACTION = this;
    try {
        $(selector.selector).each(function(id, el) {
            let element_data = ACTION.get_element_data($, el, selector);
            element_data = ACTION.clean_element_data(element_data);
            result.push(element_data);
        });
    } catch (exc) {
        this.logger.error(ACTION_PARSE_EXCEPTION, exc);
    }
    return result;
};

ActionParse.prototype.get_attr_from_current_element = function($, selector, content) {
    let element = $(content),
        element_data = this.get_element_data($, element, selector);
    element_data = this.clean_element_data(element_data);
    return element_data;
};

ActionParse.prototype.main = function(subactions) {
    let ACTION = this;

    Action.prototype.main.call(this, subactions);

    return new Promise(function(resolve, reject) {
        try {
            let selector;
            try {
                selector = ACTION.build_selector(ACTION.config.data.selector);
            } catch (exc) {
                ACTION.logger.error(CPX_SELECTOR_EXCEPTION, exc);
            }

            let pages = ACTION.get_from_store(ACTION.get_target());

            let parse_actions = pages.map(function(page) {
                return new Promise(function(resolveParse, rejectParse) {
                    try {
                        get_page_content(page, ACTION).then(function(content) {
                            try {
                                let result = [],
                                    $ = cheerio.load(content),
                                    element, element_representation;

                                if (selector.selector[0] == '>' || selector.index > -1) {
                                    result.push(ACTION.get_relative_element_data($, selector));
                                } else if (selector.selector) {
                                    result.push.apply(result, ACTION.get_many_elements_by_cpx_selector($, selector));
                                } else if (selector.attribute && !selector.selector) {
                                    result.push(ACTION.get_attr_from_current_element($, selector, content));
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
