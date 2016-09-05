var default_settings = (page, config) => {
  // page.setting('userAgent', userAgent);
  page.setting('loadImages', false);
  page.setting('resourceTimeout', 30000);

  page.on('onResourceTimeout', function(e) {
    console.log(e.errorCode);   // it'll probably be 408
    console.log(e.errorString); // it'll probably be 'Network timeout on resource'
    console.log(e.url);         // the url whose request timed out
    // phantom.exit(1);
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
