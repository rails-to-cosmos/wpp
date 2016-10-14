'use strict';

var AbstractPageAction = require('./AbstractPageAction'),
    Webpage = require('../webpage/Webpage'),

    fs = require('fs'),
    assert = require('assert');

const PAGE_TIMEOUT = 60000,
      RESOURCE_TIMEOUT = 5000;

function ActionDownload() {
    AbstractPageAction.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new AbstractPageAction();

ActionDownload.prototype.create_webpage = function(webpage) {
    let ACTION = this;
    return new Promise(function(resolve, reject) {
        webpage.create().then(function(page) {
            ACTION.$scope.page = page;
            resolve(page);
        });
    });
};

ActionDownload.prototype.main = function(subactions) {
    const ACTION = this;

    return new Promise(function(resolve_main, reject_main) {
        let webpage = new Webpage(ACTION.get_browser());

        webpage.settings = {
            resource_timeout: RESOURCE_TIMEOUT,
            user_agent: ACTION.get_settings().user_agent,
            filters: ACTION.get_settings().filters
        };

        create_webpage()
            .then(acquire_url)
            .then(init_page_observer)
            .then(open_page)
            .then(release_page_observer)
            .then(take_screenshot('download_before_scroll'))
            .then(scroll_to_bottom)
            .then(take_screenshot('download_after_scroll'))
            .then(store_page)
            .then(run_subactions)
            .then(write_report)
            .then(close_page)
            .then(transfer_result)
            .then(resolve_main)
            .catch(reject_main);

        function create_webpage() { return ACTION.create_webpage(webpage); }

        function acquire_url() {
            return new Promise(function(resolve) {
                let url = ACTION.get_target() || ACTION.get_data().url;
                ACTION.$scope.url = url;
                resolve(url);
            });
        }

        function init_page_observer() {
            return new Promise(function(resolve) {
                ACTION.$scope.page_observer = {
                    context_transfered_to_main_thread: false
                };

                setTimeout(function() {
                    if (ACTION.$scope.page_observer.context_transfered_to_main_thread === false) {
                        close_page().then(reject_main);
                    }
                }, PAGE_TIMEOUT);

                resolve();
            });
        }

        function release_page_observer() {
            return new Promise(function(resolve) {
                ACTION.$scope.page_observer.context_transfered_to_main_thread = true;
                resolve();
            });
        }

        function open_page(url) {
            return new Promise(function(resolve, reject) {
                ACTION.$scope.page.open(ACTION.$scope.url).then(function(status) {
                    if (status == 'success') {
                        resolve(status);
                    } else {
                        reject();
                    }
                }, reject);
            });
        }

        function take_screenshot(alias) {
            return function() {
                return ACTION.take_screenshot(ACTION.$scope.page, alias);
            };
        };

        function scroll_to_bottom() {
            return ACTION.scroll(ACTION.$scope.page, 0, 0);
        }

        function store_page() {
            return new Promise(function(resolve) {
                ACTION.write_to_store(ACTION.$scope.page);
                resolve();
            });
        }

        function run_subactions() {
            return new Promise(function(resolve, reject) {
                ACTION.run_subactions(subactions).then(function(subactions_result) {
                    ACTION.$scope.result = subactions_result;
                    resolve();
                }, reject);
            });
        }

        function write_report() {
            return ACTION.write_webpage_report(webpage.report);
        }

        function close_page() {
            return ACTION.close(ACTION.$scope.page);
        }

        function transfer_result() {
            return new Promise(function(resolve) {
                resolve(ACTION.$scope.result);
            });
        }
    });
};

module.exports = ActionDownload;
