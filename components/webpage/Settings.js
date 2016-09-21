'use strict';

var default_settings = function (browser, page, config) {
  page.setting('userAgent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11');
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
