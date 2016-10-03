'use strict';

var AbstractPageAction = require('./AbstractPageAction'),
    Webpage = require('../webpage/Webpage'),
    Filters = require('../webpage/Filters'),

    assert = require('assert'),
    get_page_content = require('../webpage/Utils').get_page_content;

function ActionDownload() {
    AbstractPageAction.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new AbstractPageAction();

// TODO refactor filters
ActionDownload.prototype.get_filters = function() {
    let filters = {};

    if (this.config.settings && this.config.settings.filters) {
        filters = this.config.settings.filters;
    }

    return filters;
};

ActionDownload.prototype.close = function(page) {
    try {
        let __free__ = function() {
            page.stop();
            page.close();
            page = null;
        };
        page.invokeMethod('clearMemoryCache').then(__free__, __free__);
    } catch (exc) {
        this.logger.error('Unable to close page:', exc);
    }
};

ActionDownload.prototype.run_actions_on_page = function(page, actions) {
    let ACTION = this;
    return new Promise(function(resolve, reject) {
        ACTION.scroll(page, 0, 0).then(function() {
            get_page_content(page, ACTION).then(function(content) {
                try {
                    ACTION.write_to_store(page);
                    ACTION.run_subactions(actions).then(function(result) {
                        ACTION.close(page);
                        resolve(result);
                    }, function(exc) {
                        ACTION.close(page);
                        reject(exc);
                    });
                } catch (exc) {
                    ACTION.close(page);
                    reject(exc);
                }
            }, function(exc) {
                ACTION.close(page);
                reject(exc);
            });
        });
    });
};

ActionDownload.prototype.main = function(subactions) {
    const ACTION = this;

    return new Promise(function(resolve, reject) {
        try {
            let webpage = new Webpage(ACTION.get_browser());
            webpage.create().then(function(page) {
                try {
                    let filters = ACTION.get_filters();
                    Filters.applyOnPage(page, filters);

                    let url = ACTION.config.data.url;
                    assert(url);

                    let context_transfered_to_main_thread = false;

                    page.open(url).then(function(status) {
                        try {
                            context_transfered_to_main_thread = true;

                            ACTION.run_actions_on_page(page, subactions).then(resolve, reject);
                        } catch (exc) {
                            ACTION.close(page);
                            reject(exc);
                        }
                    }, function(exc) {
                        context_transfered_to_main_thread = true;
                        ACTION.close(page);
                        reject(exc);
                    });

                    setTimeout(function() {
                        if (!context_transfered_to_main_thread) {
                            // instead of
                            ACTION.close(page);
                            reject(new Error('PhantomJS process does not responding'));

                            // TODO this:
                            // page.stop().then(function() {
                            //     ACTION.run_actions_on_page(page, subactions).then(resolve, reject);
                            // });
                        }
                    }, 30000);
                } catch (exc) {
                    ACTION.close(page);
                    reject(exc);
                }
            }, reject);
        } catch (exc) {
            reject(exc);
        }
    });
};

module.exports = ActionDownload;
