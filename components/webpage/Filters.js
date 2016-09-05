// TODO refactor

function Filter() {

}

function WhitelistFilter() {

}

WhitelistFilter.prototype = new Filter();

function BlacklistFilter() {

}

BlacklistFilter.prototype = new Filter();

function FilterFactory() {

}


function applyFiltersOnPage(page, filters) {
  page.property('onResourceRequested', function(requestData, networkRequest, filters) {
    var url = requestData.url;
    const WHITELIST_URL_FILTER = 'WhitelistUrlfilter',
          BLACKLIST_URL_FILTER = 'BlacklistUrlFilter';
    if (!(BLACKLIST_URL_FILTER in filters)) {
      filters[BLACKLIST_URL_FILTER] = {
        urls: []
      };
    }

    Array.prototype.push.apply(filters[BLACKLIST_URL_FILTER].urls, ['.*\.woff',
                                                                    '.*yandex.*',
                                                                    '.*google.*',
                                                                    '.*ttf.*',
                                                                    '.*svg.*',
                                                                    '.*facebook.*',
                                                                    '.*vk\.com.*',
                                                                    '.*ok\.ru.*',
                                                                    '.*adriver.*']);


    for (var filter_name in filters) {
      if (filter_name == WHITELIST_URL_FILTER) {
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
          // console.log('Abort (wl, url): ' + requestData.url);
          networkRequest.abort();
          return;
        }
      } else if (filter_name == BLACKLIST_URL_FILTER) {
        for (var blre_index in filters[filter_name].urls) {
          var blre = filters[filter_name].urls[blre_index];
          re = new RegExp(blre);

          if (re.test(url)) {
            // console.log('Abort (bl, url): ' + requestData.url);
            networkRequest.abort();
            return;
          }
        }
      }
    }

    console.log('Accept: ' + url);
  }, filters);
}


module.exports = {
  applyFiltersOnPage: applyFiltersOnPage
};
