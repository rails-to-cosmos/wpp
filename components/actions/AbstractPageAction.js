'use strict';

var Action = require('./Action'),
    get_page_content = require('../webpage/Utils.js').get_page_content,
    assert = require('assert'),
    fs = require('fs'),
    sleep = require('sleep-async')().sleep;

function AbstractPageAction() {
    Action.apply(this, Array.prototype.slice.call(arguments));
}

AbstractPageAction.prototype = new Action();

AbstractPageAction.prototype.close = function(page) {
    return new Promise(function(resolve, reject) {
        page.invokeMethod('clearMemoryCache')
            .then(page.close)
            .then(resolve)
            .catch(resolve);
    });
};

AbstractPageAction.prototype.need_report = function() {
    try {
        assert(this.get_settings().report);
    } catch (exc) {
        return false;
    }

    return true;
};

AbstractPageAction.prototype.get_report_filename = function(alias, ext) {
    let filename = 'report';

    alias = alias || '';
    ext = ext || 'txt';

    if (this.need_report()) {
        filename = this.get_settings().report;
        if (filename && alias) {
            filename = [filename, alias].join('_');
        }
    }

    return [filename, ext].join('.');
};

AbstractPageAction.prototype.take_screenshot = function(page, alias) {
    if (!this.need_report()) {
        return Promise.resolve();
    }

    let ACTION = this;
    return new Promise(function(resolve_screenshot, reject_screenshot) {
        let screenshot_filename = ACTION.get_report_filename(alias, 'html');
        get_page_content(page)
            .then(save_to_file(screenshot_filename))
            .then(resolve_screenshot)
            .catch(reject_screenshot);

        function save_to_file(filename) { // FIXME copy-paste from AbstractPageAction
            return function(content) {
                return new Promise(function(resolve, reject) {
                    resolve(fs.writeFile(filename, content));
                });
            };
        }
    });
};

AbstractPageAction.prototype.write_webpage_report = function(report) {
    if (!this.need_report()) {
        return Promise.resolve();
    }

    let ACTION = this;
    return new Promise(function(resolve_report, reject_report) {
        let allowed_requests_filename = ACTION.get_report_filename('requests_allowed', 'txt');
        let rejected_requests_filename = ACTION.get_report_filename('requests_rejected', 'txt');

        let $scope = {
            total_elapsed_time: 0,
            report: report
        };

        report.phantom.property('requests')
            .then(consider_phantom_report)

            .then(allowed_requests_list)
            .then(sort_requests)
            .then(allowed_build_report)
            .then(save_to_file(allowed_requests_filename))

            .then(rejected_build_report)
            .then(save_to_file(rejected_requests_filename))

            .then(resolve_report)
            .catch(reject_report);

        function consider_phantom_report(phantom_requests) {
            return new Promise(function(resolve, reject) {
                // merge allowed requests
                for (let url of Object.keys(phantom_requests.allowed)) {
                    if ($scope.report.requests.allowed[url]) {
                        $scope.report.requests.allowed[url].start = new Date(phantom_requests.allowed[url].start);
                    }
                }

                // merge rejected requests
                $scope.report.requests.rejected = [];
                for (let url of phantom_requests.rejected) {
                    $scope.report.requests.rejected.push(url);
                }

                resolve();
            });
        }

        function allowed_requests_list() {
            return new Promise(function(resolve, reject) {
                let url_list = [];
                for (let url of Object.keys(report.requests.allowed)) {
                    if (url) {
                        let elapsed_time = (report.requests.allowed[url].end - report.requests.allowed[url].start) || 0;
                        url_list.push([url, elapsed_time]);
                        $scope.total_elapsed_time += elapsed_time;
                    }
                }

                resolve(url_list);
            });
        }

        function sort_requests(url_list) {
            return new Promise(function(resolve, reject) {
                let comparator = function(a, b) {
                    return b[1] - a[1];
                };
                url_list.sort(comparator);
                resolve(url_list);
            });
        }

        function allowed_build_report(url_list) {
            return new Promise(function(resolve, reject) {
                let allowed_requests_report = $scope.total_elapsed_time + '\n';
                for (let url of url_list) {
                    allowed_requests_report += [url[0], url[1], '\n'].join(' ');
                }
                resolve(allowed_requests_report);
            });
        }

        function rejected_build_report() {
            return new Promise(function(resolve, reject) {
                let rejected_requests_report = '';
                for (let url of $scope.report.requests.rejected) {
                    rejected_requests_report += [url, '\n'].join('');
                }
                resolve(rejected_requests_report);
            });
        }

        function save_to_file(filename) {
            return function(content) {
                return new Promise(function(resolve, reject) {
                    resolve(fs.writeFile(filename, content));
                });
            };
        }
    });
};


AbstractPageAction.prototype.scroll = function(page, scroll_height, tryout) {
    let ACTION = this,
        last_height = scroll_height,
        maxtries = 20,
        sleep_timeout = 1000;

    if (tryout > maxtries) {
        return Promise.resolve();
    }

    return new Promise(function(resolve, reject) {
        page.evaluate(function() {
            window.scrollTo(0, document.body.scrollHeight);
            return document.body.scrollHeight;
        }).then(function(new_height) {
            if (new_height == last_height) {
                sleep(sleep_timeout, resolve);
            } else {
                last_height = new_height;
                ACTION.scroll(page, last_height, ++tryout).then(function() {
                    sleep(sleep_timeout, resolve);
                }).catch(reject);
            }
        }).catch(reject);
    });
};

module.exports = AbstractPageAction;
