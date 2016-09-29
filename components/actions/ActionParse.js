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

ActionParse.prototype.clean_element_data = function(element_data) {
    let dc = new DataCleaner();
    return dc.clean(element_data);
};

ActionParse.prototype.main = function(subactions) {
    let ACTION = this;

    Action.prototype.main.call(this, subactions);

    return new Promise(function(resolve, reject) {
        try {
            let selector;
            try {
                selector = new ComplexSelector(ACTION.config.data.selector);
            } catch (exc) {
                ACTION.logger.error(CPX_SELECTOR_EXCEPTION, exc);
            }

            let pages = ACTION.get_from_store(ACTION.get_target());

            let parse_actions = pages.map(function(page) {
                return new Promise(function(resolveParse, rejectParse) {
                    try {
                        get_page_content(page, ACTION).then(function(content) {
                            try {
                                let $ = cheerio.load(content);
                                ACTION.push_to_store(selector.apply($));
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
