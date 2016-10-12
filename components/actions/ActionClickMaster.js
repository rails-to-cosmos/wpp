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

    return new Promise(function(resolveAllPages, rejectAllPages) {
        try {
            var actions = pages.map(function(page) {
                return new Promise(function(resolve, reject) {
                    try {
                        let xpath_injection = new XPathInjection();
                        xpath_injection.apply(page).then(function() {
                            try {
                                const selector = ACTION.get_data().selector;
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
                                                click_config.name = ACTION.get_name() + '__' + index;
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

                                                    let slave_action = slaves.pop();
                                                    slave_action.main(subactions).then(function() {
                                                        let promises = [
                                                            ACTION.take_screenshot(page, 'click_after_' + slave_action.get_name()),
                                                            processSlaves(slaves)
                                                        ];

                                                        Promise.all(promises).then(resolveSlave, rejectSlave);
                                                    }, rejectSlave);
                                                } catch (exc) {
                                                    rejectSlave(exc);
                                                }
                                            });
                                        };

                                        ACTION.write_to_store(page);
                                        let promises = [
                                            ACTION.take_screenshot(page, 'click_before_click'),
                                            processSlaves(createSlaves())
                                        ];

                                        Promise.all(promises).then(function() {
                                            ACTION.finalize().then(resolve, reject);
                                        }, reject);
                                    } catch (exc) {
                                        reject(exc);
                                    }
                                }, reject);
                            } catch (exc) {
                                reject(exc);
                            }
                        }, reject);
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
