var Action = require('./Action'),
    request = require('req-fast');

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
    request(ACTION.get_url(), function(err, resp) {
      ACTION.write_to_store(resp.body);
      ACTION.run_subactions(subactions).then(function(result) {
        resolve(result);
      });
    });
  });
};

module.exports = ActionHTTPRequest;
