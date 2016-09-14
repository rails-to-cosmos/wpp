var default_settings = (browser, page, config) => {
  page.setting('userAgent', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36');
  page.setting('resourceTimeout', 60000);
  page.property('viewportSize', {width: 800, height: 600});
  page.on('onResourceTimeout', function(e) {
    console.log('PhantomJS request timed out');
    console.log(e.errorCode);   // it'll probably be 408
    console.log(e.errorString); // it'll probably be 'Network timeout on resource'
    console.log(e.url);         // the url whose request timed out
    browser.exit(1);
  });

  page.on('onError', function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
      msgStack.push('TRACE:');
      trace.forEach(function(t) {
        msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
      });
    }
  });
};

module.exports = {
  default_settings: default_settings
};
