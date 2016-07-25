var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionDownload() {
  Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new Action();

ActionDownload.prototype.get_url = function() {
  return this.config.data.url;
};

ActionDownload.prototype.get_filters = function() {
  if (this.config.settings && this.config.settings.filters) {
    return this.config.settings.filters;
  } else {
    return 0;
  }
};

ActionDownload.prototype.main = function() {
  var ACTION = this;

  return new Promise((resolve, reject) => {
    var webpage = new Webpage(ACTION.get_browser());
    webpage.create().then((page) => {
      var filters = ACTION.get_filters();
      if (filters) {
        page.property('onResourceRequested', function(requestData, networkRequest, filters) {
          var url = requestData.url;

          for (var filter_name in filters) {
            if (filter_name == 'WhitelistUrlFilter') {
              var url_in_wl = false;
              var re;

              for (var wlre_index in filters[filter_name].urls) {
                var wlre = filters[filter_name].urls[wlre_index];
                re = new RegExp(wlre);

                if (re.test(url)) {
                  url_in_wl = true;
                }
              }

              if(!url_in_wl && filters[filter_name] && filters[filter_name].urls) {
                console.log('Abort (wl, url): ' + requestData.url);
                networkRequest.abort();
                return;
              }
            } else if (filter_name == 'BlacklistUrlFilter') {
              for (var blre_index in filters[filter_name].urls) {
                var blre = filters[filter_name].urls[blre_index];
                re = new RegExp(blre);

                if (re.test(url)) {
                  console.log('Abort (bl, url): ' + requestData.url);
                  networkRequest.abort();
                  return;
                }
              }
            }
          }

          console.log('Accept: ' + url);
        }, filters);
      } // if filters

      page.open(ACTION.get_url()).then((status) => {
        page.property('content').then((content) => {
          ACTION.push_to_store(page);
          resolve();
        });
      });
    });
  });
};

module.exports = ActionDownload;
