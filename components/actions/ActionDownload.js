'use strict';

var AbstractPageAction = require('./AbstractPageAction'),
    Webpage = require('../webpage/Webpage'),

    fs = require('fs'),
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

    try {
        filters = this.config.settings.filters;
        assert(filters);
    } catch (exc) {
        filters = {};
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
            try {
                ACTION.take_screenshot(page, 'download_after_scroll');
            } catch (exc) {

            }

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

ActionDownload.prototype.write_report = function(report) {
    if (!this.need_report()) {
        return;
    }

    let allowed_requests_filename = this.get_report_filename('requests_allowed', 'txt');

    let url_list = [];
    let total_elapsed_time = 0;
    for (let url of Object.keys(report.requests.allowed)) {
        let elapsed_time = report.requests.allowed[url].elapsed_time;
        url_list.push([url, elapsed_time]);
        total_elapsed_time += elapsed_time;
    }

    let comparator = function(a, b) {
        return b[1] - a[1];
    };
    url_list.sort(comparator);

    let allowed_requests_list = total_elapsed_time + '\n';
    for (let url of url_list) {
        allowed_requests_list += [url[0], url[1], '\n'].join(' ');
    }

    fs.writeFile(allowed_requests_filename, allowed_requests_list);

    let rejected_requests_filename = this.get_report_filename('requests_rejected', 'txt');
    let rejected_requests_list = '';
    for (let url of Object.keys(report.requests.rejected)) {
        rejected_requests_list += [url, '\n'].join('');
    }
    fs.writeFile(rejected_requests_filename, rejected_requests_list);
};

ActionDownload.prototype.main = function(subactions) {
    const ACTION = this;

    return new Promise(function(resolve, reject) {
        try {
            let webpage = new Webpage(ACTION.get_browser()),
                user_agent;

            try {
                user_agent = ACTION.config.settings.user_agent;
            } catch (exc) {

            }

            webpage.settings = {
                resource_timeout: RESOURCE_TIMEOUT,
                user_agent: user_agent,
                filters: ACTION.get_filters()
            };

            webpage.create().then(function(page) {
                try {
                    let url = ACTION.config.data.url;
                    assert(url);

                    let context_transfered_to_main_thread = false;

                    page.open(url).then(function(status) {
                        try {
                            context_transfered_to_main_thread = true;
                            try {
                                ACTION.take_screenshot(page, 'download_before_scroll');
                            } catch (exc) {

                            }

                            ACTION.run_actions_on_page(page, subactions).then(
                                function(data) {
                                    ACTION.write_report(webpage.report);
                                    resolve(data);
                                }, reject);
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
                            try {
                                ACTION.take_screenshot(page, 'download_timeout');
                            } catch (exc) {

                            }

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
