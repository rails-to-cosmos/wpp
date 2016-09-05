"use strict";

const DEFAULT_BLACKLIST = ['.*\.woff',
                           '.*yandex.*',
                           '.*google.*',
                           '.*ttf.*',
                           '.*\.svg.*',
                           '.*facebook\.com.*',
                           '.*facebook\.net.*',
                           '.*odnoklassniki\.ru.*',
                           '.*pinterest\.com.*',
                           '.*vk\.com.*',
                           '.*ok\.ru.*',
                           '.*mail\.ru.*',
                           '.*adriver.*',
                           '.*reklama.*',
                           '.*\.css.*',
                           '.*\.ads.*',
                           '.*widgets.*',
                           '.*linkedin\.com.*',
                           '.*appspot\.com.*',
                           '.*index\.ru.*',
                           '.*mediametrics.*',
                           '.*visualdna.*',
                           '.*marketgid\.com.*',
                           '.*onthe\.io.*',
                           '.*price\.ru.*',
                           // '.*rambler\.ru.*',
                           '.*begun\.ru.*',
                           '.*doubleclick\.net.*',
                           '.*adfox.*',
                           '.*top100\.ru.*',
                           '.*criteo\.com.*',
                           '.*pingdom\.net.*',
                           '.*scorecardresearch\.com.*',
                           '.*infographics\.gazeta\.ru.*',
                           '.*smi2\.ru.*',
                           '.*smi2\.net.*',
                           '.*exnews\.net.*',
                          ];

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
  page.property('onResourceRequested', function(requestData, networkRequest, filters, DEFAULT_BLACKLIST) {
    const WHITELIST_URL_FILTER = 'WhitelistUrlfilter',
          BLACKLIST_URL_FILTER = 'BlacklistUrlFilter';

    if (!(BLACKLIST_URL_FILTER in filters)) {
      filters[BLACKLIST_URL_FILTER] = {
        urls: []
      };
    }


    Array.prototype.push.apply(filters[BLACKLIST_URL_FILTER].urls, DEFAULT_BLACKLIST);

    for (var filter_name in filters) {
      if (filter_name == WHITELIST_URL_FILTER) {
        var url_in_wl = false;

        for (var wlre_index in filters[filter_name].urls) {
          var wlre = filters[filter_name].urls[wlre_index];
          var re = new RegExp(wlre);

          if (re.test(requestData.url)) {
            url_in_wl = true;
          }
        }

        if(!url_in_wl && filters[filter_name] && filters[filter_name].urls) {
          networkRequest.abort();
          return;
        }
      } else if (filter_name == BLACKLIST_URL_FILTER) {
        for (var blre_index in filters[filter_name].urls) {
          var blre = filters[filter_name].urls[blre_index];
          var re = new RegExp(blre);

          if (re.test(requestData.url)) {
            networkRequest.abort();
            return;
          }
        }
      }
    }

    console.log('Accept', requestData.url);
  }, filters, DEFAULT_BLACKLIST);
}


module.exports = {
  applyFiltersOnPage: applyFiltersOnPage
};
