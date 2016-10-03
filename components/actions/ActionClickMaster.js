'use strict';

var AbstractPageAction = require('./AbstractPageAction'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),
    deepcopy = require('deepcopy');

function ActionClickMaster() {
    AbstractPageAction.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickMaster.prototype = new AbstractPageAction();

ActionClickMaster.prototype.main = function (subactions) {
    const ACTION = this,
          SLAVE_ACTION_TYPE = 'AClickSlave';

    var pages = ACTION.get_from_store(ACTION.get_target());

    AbstractPageAction.prototype.main.call(this, subactions);

    return new Promise(function(resolveAllPages, rejectAllPages) {
        try {
            var actions = pages.map(function(page) {
                return new Promise(function(resolve, reject) {
                    try {
                        let xpath_injection = new XPathInjection();
                        xpath_injection.apply(page).then(function() {
                            try {
                                const selector = ACTION.config.data.selector;
                                page.evaluate(function(selector) {
                                    var result = [];
                                    var elements = document.querySelectorAll(selector);
                                    for (var ei=0; ei<elements.length; ei++) {
                                        var xpel = window.__wpp__.xpath(elements[ei]);
                                        result.push(xpel);
                                    }

                                    return result;
                                }, selector).then(function(buttons) {
                                    try {
                                        let createSlaves = function() {
                                            var slaves = [];
                                            for (var index in buttons) {
                                                var click_config = deepcopy(ACTION.config);
                                                click_config.type = SLAVE_ACTION_TYPE;
                                                click_config.name = ACTION.get_name() + ' (' + index + ')';
                                                click_config.data = {
                                                    xpath: buttons[index]
                                                };

                                                var slave = ACTION.factory.create_action(click_config, ACTION);
                                                slaves.push(slave);
                                            }

                                            return slaves;
                                        };

                                        let processSlaves = function(slaves) {
                                            return new Promise(function(resolveSlave, rejectSlave) {
                                                try {
                                                    if (slaves.length == 0) {
                                                        resolveSlave();
                                                        return;
                                                    }

                                                    var slave_action = slaves.pop();

                                                    slave_action.main(subactions).then(function() {
                                                        processSlaves(slaves).then(resolveSlave);
                                                    }, function(exc) {
                                                        rejectSlave(exc);
                                                    });
                                                } catch (exc) {
                                                    rejectSlave(exc);
                                                }
                                            });
                                        };

                                        ACTION.write_to_store(page);
                                        processSlaves(createSlaves()).then(function() {
                                            try {
                                                ACTION.finalize().then(function(result) {
                                                    resolve(result);
                                                }, function(exc) {
                                                    reject(exc);
                                                });
                                            } catch (exc) {
                                                reject(exc);
                                            }
                                        }, function(exc) {
                                            reject(exc);
                                        });
                                    } catch (exc) {
                                        reject(exc);
                                    }
                                }, function(exc) {
                                    reject(exc);
                                });
                            } catch (exc) {
                                reject(exc);
                            }
                        }, function(exc) {
                            reject(exc);
                        });
                    } catch (exc) {
                        reject(exc);
                    }
                });
            });
        } catch (exc) {
            rejectAllPages(exc);
            return;
        }

        Promise.all(actions).then(function(result) {
            resolveAllPages(result[0]);
        }, function(exc) {
            rejectAllPages(exc);
        });
    });
};

module.exports = ActionClickMaster;
