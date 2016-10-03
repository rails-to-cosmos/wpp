'use strict';

var default_settings = function (browser, page, config) {
    page.setting('userAgent', 'Mozilla/5.0 (Windows NT 5.1; rv:5.0.1) Gecko/20100101 Firefox/5.0.1');
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
