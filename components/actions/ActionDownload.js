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

ActionDownload.prototype.main = function(subactions) {
    const ACTION = this;

    return new Promise(function(resolve_main, reject_main) {
        let webpage = new Webpage(ACTION.get_browser());

        webpage.settings = {
            resource_timeout: RESOURCE_TIMEOUT,
            user_agent: ACTION.get_settings().user_agent,
            filters: ACTION.get_settings().filters
        };

        let $scope = {};
        webpage.create()
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

        function acquire_url(page) {
            return new Promise(function(resolve) {
                let url = ACTION.get_target() || ACTION.get_data().url;
                $scope.page = page;
                $scope.url = url;
                resolve(url);
            });
        }

        function init_page_observer() {
            return new Promise(function(resolve) {
                $scope.page_observer = {
                    context_transfered_to_main_thread: false
                };

                setTimeout(function() {
                    if ($scope.page_observer.context_transfered_to_main_thread === false) {
                        close_page().then(resolve_main);
                    }
                }, PAGE_TIMEOUT);

                resolve();
            });
        }

        function release_page_observer() {
            return new Promise(function(resolve) {
                $scope.page_observer.context_transfered_to_main_thread = true;
                resolve();
            });
        }

        function open_page(url) {
            return new Promise(function(resolve, reject) {
                $scope.page.open($scope.url).then(function(status) {
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
                return new Promise(function(resolve, reject) {
                    ACTION.take_screenshot($scope.page, alias)
                        .then(resolve, reject);
                });
            };
        };

        function scroll_to_bottom() {
            return new Promise(function(resolve, reject) {
                ACTION.scroll($scope.page, 0, 0).then(resolve, reject);
            });
        }

        function store_page() {
            return new Promise(function(resolve) {
                ACTION.write_to_store($scope.page);
                resolve();
            });
        }

        function run_subactions() {
            return new Promise(function(resolve, reject) {
                ACTION.run_subactions(subactions).then(function(subactions_result) {
                    $scope.result = subactions_result;
                    resolve();
                }, reject);
            });
        }

        function write_report() {
            return new Promise(function(resolve) {
                ACTION.write_webpage_report(webpage.report);
                resolve();
            });
        }

        function close_page() {
            return new Promise(function(resolve, reject) {
                ACTION.close($scope.page).then(resolve, reject);
            });
        }

        function transfer_result() {
            return new Promise(function(resolve) {
                resolve($scope.result);
            });
        }
    });
};

module.exports = ActionDownload;
