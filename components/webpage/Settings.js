'use strict';

var default_settings = function (browser, page, config) {
    page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/537.86.7');
    page.setting('resourceTimeout', 5000);
    page.property('viewportSize', {width: 800, height: 600});

    page.on('onResourceTimeout', function(e) {

    });

    page.on('onError', function() {

    });

    page.on('onResourceError', function(msg, trace) {

    });
};

module.exports = {
    default_settings: default_settings
};
