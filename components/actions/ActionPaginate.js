'use strict';

const ActionClickMaster = require('./ActionClickMaster'),
      Webpage = require('../webpage/Webpage'),
      XPathInjection = require('../injections/XPathInjection'),
      deepcopy = require('deepcopy'),
      DataCleaner = require('../webpage/DataCleaner');

function ActionPaginate() {
    ActionClickMaster.apply(this, Array.prototype.slice.call(arguments));
}

ActionPaginate.prototype = new ActionClickMaster();

ActionPaginate.prototype.main = function (subactions) {
    const ACTION = this,
          SLAVE_ACTION_TYPE = 'AClickSlave',
          PAGINATION_LIMIT = 100;

    let pages = ACTION.get_from_store(ACTION.get_target()),
        visited = [];

    ActionClickMaster.prototype.main.call(this, subactions);

    return new Promise(function(resolveAllPages, rejectAllPages) {
        try {
            let dependent_subactions = [],
                independent_subactions = [];

            let actions = pages.map(function(page) {
                try {
                    ACTION.write_to_store(page);
                    return new Promise(function(resolve, reject) {
                        try {
                            ACTION.take_screenshot(page, 'page_before_page');
                            scanPaginationButtons();
                        } catch (exc) {
                            reject(exc);
                        }

                        function scanPaginationButtons() {
                            let xpath_injection = new XPathInjection();
                            xpath_injection.apply(page).then(function() {
                                const selector = ACTION.config.data.selector;
                                page.evaluate(function(selector) {
                                    var result = {};
                                    var elements = document.querySelectorAll(selector);
                                    for (var ei=0; ei<elements.length; ei++) {
                                        var xpel = window.__wpp__.xpath(elements[ei]);
                                        var obj = elements[ei];
                                        var name = obj.textContent ? obj.textContent : obj.innerText;
                                        result[name] = xpel;
                                    }

                                    return result;
                                }, selector).then(function(buttons) {
                                    try {
                                        if (Object.keys(buttons).length == 0) {
                                            ACTION.run_subactions(subactions).then(resolve, reject);
                                            return;
                                        }

                                        console.log('buttons:', buttons);

                                        var found = false,
                                            dc = new DataCleaner();
                                        for (var name in buttons) {
                                            if (visited.indexOf(name) > -1) {
                                                continue;
                                            }

                                            found = true;
                                            break;
                                        }

                                        if (!found) {
                                            ACTION.finalize().then(resolve, reject);
                                            return;
                                        }

                                        var click_config = deepcopy(ACTION.config);
                                        click_config.type = SLAVE_ACTION_TYPE;
                                        click_config.name = ACTION.config.name + '__' + dc.clean(name);
                                        click_config.data = {
                                            xpath: buttons[name]
                                        };

                                        if (dependent_subactions.length == 0 && independent_subactions.length == 0) {
                                            for (var subaction of subactions) {
                                                if (subaction.config.target == ACTION.config.name) {
                                                    dependent_subactions.push(subaction);
                                                } else {
                                                    independent_subactions.push(subaction);
                                                }
                                            }
                                        }

                                        var slave_action = ACTION.factory.create_action(click_config, ACTION);
                                        slave_action.main(dependent_subactions).then(function() {
                                            visited.push(name);
                                            console.log('paginate name', slave_action.config.name);
                                            try {
                                                ACTION.take_screenshot(page, 'page_after_' + slave_action.config.name);
                                            } catch (exc) {

                                            }

                                            if (visited.length < PAGINATION_LIMIT) {
                                                scanPaginationButtons();
                                            } else {
                                                ACTION.finalize().then(resolve, reject);
                                            }
                                        }, reject);
                                    } catch (exc) {
                                        reject(exc);
                                    }
                                }, rejectAllPages);
                            }, rejectAllPages);
                        };
                    });
                } catch (exc) {
                    rejectAllPages(exc);
                }

                return true;
            });

            Promise.all(actions).then(function(result) {
                var isl = independent_subactions.length;
                if (isl > 0) {
                    var iss = [];
                    for (var is of independent_subactions) {
                        iss.push(is.config.name);
                    }
                    ACTION.factory.inherit(independent_subactions[0], ACTION);
                    independent_subactions[0].main(independent_subactions.slice(1, isl)).then(function(result) {
                        resolveAllPages(result[0]);
                    });
                } else { // nothing to do
                    resolveAllPages(result[0]);
                }
            }, rejectAllPages);
        } catch (exc) {
            rejectAllPages(exc);
        }
    });
};

module.exports = ActionPaginate;
