'use strict';

const Action = require('./Action'),
      request = require('request'),
      charset = require('charset'),
      iconv = require('iconv-lite');

function ActionHTTPRequest() {
    Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionHTTPRequest.prototype = new Action();

ActionHTTPRequest.prototype.get_url = function() {
    return this.get_target() || this.get_data().url;
};

ActionHTTPRequest.prototype.main = function (subactions) {
    const ACTION = this;

    return new Promise(function(resolve, reject) {
        try {
            ACTION.console_info('ActionHTTPRequest started');
            request({
                url: ACTION.get_url(),
                timeout: 60000,
                encoding: null,
                headers: {
                    'Accept': "text, text/plain, text/xml",
                    'Accept-Encoding': "UTF-8",
                    'Content-Type': "text/plain; charset=utf-8;"
                }
            }, function(err, resp) {
                try {
                    let body;
                    if (err) {
                        reject(err);
                        return;
                    }

                    try {
                        body = iconv.decode(resp.body, charset(resp.headers, resp.body));
                    } catch (exc) {
                        try {
                            body = resp.body;
                        } catch (exc) {
                            reject(exc);
                            return;
                        }
                    }

                    ACTION.write_to_store(body);
                    ACTION.run_subactions(subactions).then(resolve, reject);
                } catch (exc) {
                    reject(exc);
                }
            }).on('error', reject);
        } catch (exc) {
            reject(exc);
        }
    });
};

module.exports = ActionHTTPRequest;
