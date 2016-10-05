'use strict';

var AbstractPageAction = require('./AbstractPageAction'),
    Webpage = require('../webpage/Webpage'),
    Filters = require('../webpage/Filters'),

    assert = require('assert'),
    get_page_content = require('../webpage/Utils').get_page_content;

const PAGE_TIMEOUT = 60000,
      RESOURCE_TIMEOUT = 5000;

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
            ACTION.take_screenshot(page, 'download_after_scroll');
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
            let webpage = new Webpage(ACTION.get_browser()),
                user_agent;

            try {
                user_agent = ACTION.config.settings.user_agent;
                if (!'user_agent' in ACTION.config.settings) {
                    throw new Error('User Agent not found in download action settings');
                }
            } catch (exc) {
                user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/537.86.7';
            }

            webpage.create(RESOURCE_TIMEOUT, user_agent).then(function(page) {
                try {
                    let filters = ACTION.get_filters();
                    Filters.applyOnPage(page, filters);

                    let url = ACTION.config.data.url;
                    assert(url);

                    let context_transfered_to_main_thread = false;

                    page.open(url).then(function(status) {
                        try {
                            context_transfered_to_main_thread = true;
                            ACTION.take_screenshot(page, 'download_before_scroll');
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
                            ACTION.take_screenshot(page, 'download_timeout');
                            ACTION.close(page);
                            reject(new Error('PhantomJS process does not responding'));
                        }
                    }, PAGE_TIMEOUT);
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
