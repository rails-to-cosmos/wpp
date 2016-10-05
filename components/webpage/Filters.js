"use strict";

const DEFAULT_BLACKLIST = ['.*\.woff',
                           '.*\.ttf.*',
                           '.*\.svg.*',

                           '.*yandex.*',
                           '.*http.*:\/\/google.*',
                           '.*http.*:\/\/facebook\.com.*',
                           '.*http.*:\/\/facebook\.net.*',
                           '.*http.*:\/\/odnoklassniki\.ru.*',

                           '.*http.*:\/\/pinterest\.com.*',
                           '.*http.*:\/\/vkontakte\.ru.*',
                           '.*http.*:\/\/vk\.com.*',
                           '.*http.*:\/\/ok\.ru.*',
                           '.*http.*:\/\/mail\.ru.*',
                           '.*http.*:\/\/adriver.*',
                           '.*http.*:\/\/reklama.*',

                           '.*http.*:\/\/\.css.*',
                           '.*http.*:\/\/\.ads.*',
                           '.*http.*:\/\/linkedin\.com.*',

                           '.*http.*:\/\/appspot\.com.*',
                           '.*http.*:\/\/index\.ru.*',
                           '.*http.*:\/\/mediametrics.*',
                           '.*http.*:\/\/visualdna.*',
                           '.*http.*:\/\/marketgid\.com.*',

                           '.*http.*:\/\/onthe\.io.*',
                           '.*http.*:\/\/price\.ru.*',
                           '.*http.*:\/\/rambler\.ru.*',
                           '.*http.*:\/\/begun\.ru.*',
                           '.*http.*:\/\/doubleclick\.net.*',
                           '.*http.*:\/\/adfox.*',
                           '.*http.*:\/\/top100\.ru.*',

                           '.*http.*:\/\/criteo\.com.*',
                           '.*http.*:\/\/pingdom\.net.*',
                           '.*http.*:\/\/scorecardresearch\.com.*',
                           '.*http.*:\/\/infographics\.gazeta\.ru.*',
                           '.*http.*:\/\/smi2\.ru.*',
                           '.*http.*:\/\/smi2\.net.*',
                           '.*http.*:\/\/exnews\.net.*',
                           '.*http.*:\/\/youtube\.com.*',
                           '.*http.*:\/\/openstat\.net.*',

                           '.*audio-player.*',
                           '.*wmvplayer.*',
                           '.*mediaplayer.*',
                           '.*flvscript\.js.*',

                           '.*cdn\.inaudium\.com\/js\/adtctr\.js.*',
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
        const WHITELIST_URL_FILTER = 'whitelist',
              BLACKLIST_URL_FILTER = 'blacklist';

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
            // console.log('Deny', requestData.url);
            networkRequest.abort();
        } else {
            // console.log('Accept', requestData.url);
        }
    }, filters, DEFAULT_WHITELIST, DEFAULT_BLACKLIST);
}


module.exports = {
    applyOnPage: applyOnPage
};
