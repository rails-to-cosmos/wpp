var Action = require('./Action'),
    request = require('request'),
    charset = require('charset'),
    iconv = require('iconv-lite');

function ActionHTTPRequest() {
  Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionHTTPRequest.prototype = new Action();

ActionHTTPRequest.prototype.get_url = function() {
  return this.config.data.url;
};

ActionHTTPRequest.prototype.main = function (subactions) {
  var ACTION = this;

  Action.prototype.main.call(this, subactions);

  return new Promise(function(resolve, reject) {
    console.log('ActionHTTPRequest started');
    request({
      url: ACTION.get_url(),
      timeout: 60000,
      encoding: null,
      headers: {
        "Accept": "text, text/plain, text/xml",
        "Accept-Encoding": "UTF-8",
        'Content-Type': "text/plain; charset=utf-8;"
      }
    },
            function(err, resp) {
              var body = iconv.decode(resp.body, charset(resp.headers, resp.body));
              ACTION.write_to_store(body);
              ACTION.run_subactions(subactions).then(function(result) {
                resolve(result);
              });
            });
  });
};

module.exports = ActionHTTPRequest;
