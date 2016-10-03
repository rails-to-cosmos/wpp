'use strict';

var Action = require('./Action'),
    sleep = require('sleep-async')();

function AbstractPageAction() {
    Action.apply(this, Array.prototype.slice.call(arguments));
}

AbstractPageAction.prototype = new Action();

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
                sleep.sleep(sleep_timeout, resolve);
            } else {
                last_height = new_height;
                ACTION.scroll(page, last_height, ++tryout).then(function() {
                    sleep.sleep(sleep_timeout, resolve);
                }, reject);
            }
        });
    });
};

module.exports = AbstractPageAction;
