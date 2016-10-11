'use strict';

var AbstractPageAction = require('./AbstractPageAction'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),
    ClickInjection = require('../injections/ClickInjection'),
    get_page_content = require('../webpage/Utils').get_page_content;

function ActionClickSlave() {
    AbstractPageAction.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickSlave.prototype = new AbstractPageAction();

ActionClickSlave.prototype.main = function (subactions) {
    const ACTION = this,
          path = ACTION.config.data.xpath,
          pages = ACTION.get_from_store(ACTION.get_target());

    return new Promise(function(resolveAllPages, rejectAllPages) {
        try {
            var actions = pages.map(function(page) {
                return new Promise(function(resolveClick, rejectClick) {
                    try {
                        // Waiting Strategies
                        const WS_UNDEFINED = 0,
                              WS_PAGE_LOADING = 1,
                              WS_JQUERY_ACTIVE_AJAXES = 2;

                        let wait_strategy = WS_UNDEFINED;

                        let subactions_running_lock = 1;
                        let try_to_run_subactions = function() {
                            if (subactions_running_lock == 0) {
                                return;
                            }

                            subactions_running_lock = 0; // lock
                            ACTION.scroll(page, 0, 0).then(function() {
                                ACTION.run_subactions(subactions).then(function(result) {
                                    try {
                                        resolveClick(result);
                                    } catch (exc) {
                                        rejectClick(exc);
                                    }
                                }, function(exc) {
                                    rejectClick(exc);
                                });
                            });
                        };

                        page.off('onLoadStarted');
                        page.on('onLoadStarted', function(status) {
                            // load may be started many times
                            if (wait_strategy == WS_UNDEFINED) {
                                wait_strategy = WS_PAGE_LOADING;
                            }
                        });

                        page.off('onLoadFinished');
                        page.on('onLoadFinished', function(status) {
                            if (wait_strategy == WS_PAGE_LOADING) {
                                try_to_run_subactions();
                            }
                        });

                        var xpath_module = new XPathInjection();
                        var click_module = new ClickInjection();
                        xpath_module.apply(page).then(function() {
                            try {
                                click_module.apply(page).then(function() {
                                    try {
                                        page.evaluate(function(path) {
                                            try {
                                                var element = __wpp__.get_element_by_xpath(path);
                                                __wpp__.click(element);
                                            } catch (err) {
                                                return false;
                                            }
                                            return element.outerHTML;
                                        }, path).then(function(result) {
                                            try {
                                                if (!result) {
                                                    ACTION.finalize().then(function(result) {
                                                        resolveClick(result);
                                                    }, function(exc) {
                                                        rejectClick(exc);
                                                    });
                                                }

                                                var wait_if_needed = function() {
                                                    if (wait_strategy == WS_UNDEFINED) {
                                                        wait_strategy = WS_JQUERY_ACTIVE_AJAXES;
                                                    } else {
                                                        return;
                                                    }

                                                    const waiting_limit = 10;
                                                    let current_try = 0;

                                                    let wait_for_active_requests = function() {
                                                        return new Promise(function(resolveActiveRequests, rejectActiveRequests) {
                                                            try {
                                                                page.evaluate(function() {
                                                                    try {
                                                                        return $.active;
                                                                    } catch (err) {
                                                                        return 0;
                                                                    }
                                                                }).then(function(active_requests) {
                                                                    try {
                                                                        if(active_requests > 0 && current_try < waiting_limit) {
                                                                            var resolver = function() {
                                                                                try {
                                                                                    wait_for_active_requests().then(resolveActiveRequests, rejectActiveRequests);
                                                                                } catch (exc) {
                                                                                    rejectActiveRequests(exc);
                                                                                }
                                                                            };
                                                                            setTimeout(resolver, 500);
                                                                            current_try++;
                                                                        } else {
                                                                            resolveActiveRequests();
                                                                        }
                                                                    } catch (exc) {
                                                                        rejectActiveRequests(exc);
                                                                    }
                                                                }, rejectActiveRequests);
                                                            } catch (exc) {
                                                                rejectActiveRequests(exc);
                                                            }
                                                        });
                                                    };

                                                    wait_for_active_requests().then(function() {
                                                        try {
                                                            try_to_run_subactions();
                                                        } catch (exc) {
                                                            rejectClick(exc);
                                                        }
                                                    }, rejectClick);
                                                };
                                                setTimeout(wait_if_needed, 100);
                                            } catch (exc) {
                                                rejectClick(exc);
                                            }
                                        }, rejectClick);
                                    } catch (exc) {
                                        rejectClick(exc);
                                    }
                                }, rejectClick);
                            } catch (exc) {
                                rejectClick(exc);
                            }
                        }, rejectClick);
                    } catch (exc) {
                        rejectClick(exc);
                    }
                });
            });
        } catch (exc) {
            rejectAllPages(exc);
        }

        Promise.all(actions).then(resolveAllPages, rejectAllPages);
    });
};

module.exports = ActionClickSlave;
