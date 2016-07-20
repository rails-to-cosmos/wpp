var default_settings = (page, config) => {
  // page.setting('userAgent', userAgent);
  page.setting('loadImages', false);

  page.on('onError', (msg, trace) => {
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
