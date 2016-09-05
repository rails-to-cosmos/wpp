var Action = require('./Action'),
    request = require('request');

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
      timeout: 60000
    },
            function(err, resp) {
              console.log('ActionHTTPRequest finished');
              ACTION.write_to_store(resp.body);
              ACTION.run_subactions(subactions).then(function(result) {
                resolve(result);
              });
            });
  });
};

module.exports = ActionHTTPRequest;
