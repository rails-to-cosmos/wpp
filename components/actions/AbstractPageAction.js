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
    if (!page) {
        return Promise.resolve();
    }

    return new Promise(function(resolve, reject) {
        page.invokeMethod('clearMemoryCache')
            .then(page.close())
            .then(resolve)
            .catch(reject);
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
    return new Promise(function(resolve, reject) {
        let filename = ACTION.get_report_filename(alias, 'html');
        get_page_content(page).then(function(content) {
            fs.writeFile(filename, content, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

AbstractPageAction.prototype.write_webpage_report = function(report) {
    if (!this.need_report()) {
        return;
    }

    let allowed_requests_filename = this.get_report_filename('requests_allowed', 'txt');

    let url_list = [];
    let total_elapsed_time = 0;
    for (let url of Object.keys(report.requests.allowed)) {
        let elapsed_time = report.requests.allowed[url].elapsed_time || 0;
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


AbstractPageAction.prototype.scroll = function(page, scroll_height, tryout) {
    let ACTION = this,
        last_height = scroll_height,
        maxtries = 20,
        sleep_timeout = 1000;

    if (tryout > maxtries) {
        return new Promise(function(resolve, reject) {
            resolve();
        });
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
                }, reject);
            }
        });
    });
};

module.exports = AbstractPageAction;
