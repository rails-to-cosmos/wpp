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
                           '.*rambler\.ru.*',
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
                           '.*audio-player.*',
                           '.*wmvplayer.*',
                           '.*mediaplayer.*',
                           '.*flvscript\.js.*',
                           '.*youtube\.com.*',
                           '.*openstat\.net.*',
                          ],
      DEFAULT_WHITELIST = ['.*cdn-comments\.rambler\.ru.*',
                           '.*c\.rambler\.ru.*',
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

function applyOnPage(page, filters) {
  page.property('onResourceRequested', function(requestData, networkRequest, filters,
                                                DEFAULT_WHITELIST, DEFAULT_BLACKLIST) {
    const WHITELIST_URL_FILTER = 'WhitelistUrlfilter',
          BLACKLIST_URL_FILTER = 'BlacklistUrlFilter';

    if (!(WHITELIST_URL_FILTER in filters)) {
      filters[WHITELIST_URL_FILTER] = {
        urls: []
      };
    }

    if (!(BLACKLIST_URL_FILTER in filters)) {
      filters[BLACKLIST_URL_FILTER] = {
        urls: []
      };
    }

    Array.prototype.push.apply(filters[BLACKLIST_URL_FILTER].urls, DEFAULT_BLACKLIST);
    Array.prototype.push.apply(filters[WHITELIST_URL_FILTER].urls, DEFAULT_WHITELIST);

    function url_in_list(url, list) {
      for (var url_index in filters[list].urls) {
        var re = new RegExp(filters[list].urls[url_index]);
        if (re.test(url)) {
          return true;
        }
      }

      return false;
    }

    if (url_in_list(requestData.url, BLACKLIST_URL_FILTER) &&
        !url_in_list(requestData.url, WHITELIST_URL_FILTER)) {
      networkRequest.abort();
    } else {
      // // console.log('Accept', requestData.url);
    }
  }, filters, DEFAULT_WHITELIST, DEFAULT_BLACKLIST);
}


module.exports = {
  applyOnPage: applyOnPage
};
