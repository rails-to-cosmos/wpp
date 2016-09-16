var default_settings = (browser, page, config) => {
  page.setting('userAgent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11');
  page.setting('resourceTimeout', 60000);
  page.property('viewportSize', {width: 800, height: 600});

  page.on('onResourceTimeout', function(e) {
    console.log('PhantomJS request timed out');
    console.log(e.errorCode);   // it'll probably be 408
    console.log(e.errorString); // it'll probably be 'Network timeout on resource'
    console.log(e.url);         // the url whose request timed out
    browser.exit(1);
  });

  page.on('onError', function() {
    //
  });

  page.on('onResourceError', function(msg, trace) {
    // console.log('Resource error:');
    // console.log(msg, trace);
  });
};

module.exports = {
  default_settings: default_settings
};
