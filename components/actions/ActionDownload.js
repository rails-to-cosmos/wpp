var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionDownload() {
  Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new Action();

ActionDownload.prototype.main = function() {
  var BROWSER = this.browser,
      CONFIG = this.config,
      STORE = this.store;

  return new Promise((resolve, reject) => {
    var wp = new Webpage(BROWSER);
    wp.create().then((page) => {
      // important! do not use () => {}, use function(requestData, networkRequest) instead
      // this function runs in phantomjs layer

      if (CONFIG.settings && CONFIG.settings.filters) {
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
        }, CONFIG.settings.filters);
      };

      page.open(CONFIG.data.url).then((status) => {
        page.property('content').then((content) => {
          STORE.push(CONFIG.name, page, false);
          resolve();
        });
      });
    });
  });
};

module.exports = ActionDownload;
