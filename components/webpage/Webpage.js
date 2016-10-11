'use strict';

const DEFAULT_BLACKLIST = [
    '.*\.woff',
    '.*\.ttf.*',
    '.*\.svg.*',

    '.*\.css.*',

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

    '.*http.*://.*.css.*',
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
    'googleads.g.doubleclick.net',
], DEFAULT_WHITELIST = [
    '.*cdn-comments\.rambler\.ru.*',
    '.*c\.rambler\.ru.*',
];


function Webpage(browser, config) {
    this.browser = browser;
    this.page = null;
    this.settings = {
        resource_timeout: 5000,
        user_agent: false,
        filters: {

        },
        viewport_size: {
            width: 800,
            height: 600
        }
    };
    this.report = {
        requests: {
            rejected: {},
            allowed: {}
        }
    };

    this.phantomjs_report = browser.createOutObject();
    this.phantomjs_report.requests = {
        rejected: {},
        allowed: {}
    };
};

Webpage.prototype.apply_filters = function(custom_filters) {
    let phantomjs_report = this.phantomjs_report,
        report = this.report;

    // this.page.on('onNavigationRequested', function(url, type, willNavigate, main) {
    //     console.log('-');
    //     console.log('Trying to navigate to: ' + url);
    //     console.log('Caused by: ' + type);
    //     console.log('Will actually navigate: ' + willNavigate);
    //     console.log('Sent from the page\'s main frame: ' + main);
    // });

    this.page.on('onResourceReceived', function(res) {
        phantomjs_report.property('requests').then(function(requests) {
            report.requests.rejected = requests.rejected;

            if (res.stage == 'start') {
                report.requests.allowed[res.url] = {
                    start: new Date()
                };
            }

            if (res.stage == 'end') {
                if (!report.requests.allowed[res.url].start) {
                    report.requests.allowed[res.url].start = requests.allowed[res.url].start;
                }

                report.requests.allowed[res.url].end = new Date();
                report.requests.allowed[res.url].elapsed_time = report.requests.allowed[res.url].end - report.requests.allowed[res.url].start;
            }
        });
    });

    this.page.property('onResourceRequested', function(requestData, networkRequest, filters,
                                                       DEFAULT_WHITELIST, DEFAULT_BLACKLIST,
                                                       report) {
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
                if (url == filters[list].urls[url_index] || url.indexOf(filters[list].urls[url_index]) > -1 || re.test(url)) {
                    return true;
                } else {

                }
            }

            return false;
        }

        // console.log('-');
        // for (var header in requestData.headers) {
        //     console.log(requestData.headers[header].name, requestData.headers[header].value);
        // }

        // if (requestData['Content-Type'] == 'text/css') {
        //     report.requests.rejected[requestData.url] = {};
        //     networkRequest.abort();
        //     console.log('Abort', requestData.url, '(css)');
        //     return;
        // }

        if (url_in_list(requestData.url, BLACKLIST_URL_FILTER) &&
            !url_in_list(requestData.url, WHITELIST_URL_FILTER)) {
            report.requests.rejected[requestData.url] = {};
            // console.log('Abort', requestData.url);
            networkRequest.abort();
        } else {
            report.urls.allowed[requestData.url] = {};
            // console.log('Allow', requestData.url);
        }
    }, custom_filters, DEFAULT_WHITELIST, DEFAULT_BLACKLIST, this.phantomjs_report);
};

Webpage.prototype.create = function() {
    const WP = this,
          BROWSER = this.browser,
          CONFIG = this.config;

    return new Promise(function (resolve, reject) {
        BROWSER.createPage().then(function (page) {
            WP.page = page;
            WP.apply_filters(WP.settings.filters);
            if (WP.settings.user_agent) {
                page.setting('userAgent', WP.settings.user_agent);
            }

            page.setting('resourceTimeout', WP.settings.resource_timeout);
            page.property('viewportSize', WP.settings.viewport_size);

            page.on('onResourceTimeout', function(request) {
                // ignore slowpokes
                // console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
            });

            page.on('onError', function(err) {

            });

            page.on('onResourceError', function(msg, trace) {

            });

            resolve(page);
        }, function(exc) {
            reject(exc);
        });
    });
};

module.exports = Webpage;
