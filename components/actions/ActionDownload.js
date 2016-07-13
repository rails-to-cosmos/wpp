var oop = require('oop-module'),
    Webpage = oop.class('../webpage/Webpage');

exports.constructor = (_config, _result_store, _browser_instance) => {
  exports.config = _config;
  exports.result_store = _result_store;
  exports.browser_instance = _browser_instance;
};

exports.do = () => {
  return new Promise((resolve, reject) => {
    var wp = new Webpage(exports.browser_instance);
    wp.create().then((page) => {
      // important! do not use () => {}, use function(requestData, networkRequest) instead
      if (exports.config.settings && exports.config.settings.filters) {
        page.property('onResourceRequested', function(requestData, networkRequest, filters) {
          var url = requestData.url;

          for (var filter_name in filters) {
            switch(filter_name) {

            case 'WhitelistUrlFilter':
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

              break;

            case 'BlacklistUrlFilter':
              for (var blre_index in filters[filter_name].urls) {
                var blre = filters[filter_name].urls[blre_index];
                re = new RegExp(blre);

                if (re.test(url)) {
                  console.log('Abort (bl, url): ' + requestData.url);
                  networkRequest.abort();
                  return;
                }
              }

              break;
            }
          }

          console.log('Accept: ' + url);
        }, exports.config.settings.filters);
      };

      page.open(exports.config.data.url).then((status) => {
        page.property('content').then((content) => {
          exports.result_store.push(exports.config.name, page, false);
          resolve();
        });
      });
    });
  });
};
