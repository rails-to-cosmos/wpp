'use strict';

const DEFAULT_BLACKLIST = [
    '.woff', '.ttf', '.svg',
    'doubleclick.net',
    'googletagservices.com',
    'googleapis',
    'google-analytics',
    'google.com',
    'mail.ru',
    'vk.com/js',
    'vk.com/css',
    'vk.com/share',
    'facebook.com',
    'facebook.net',
    'chartbeat.com',
    'static.aio.media',
    '4smi.ru',
    'lentainform.com',
    'ria.ru//js/adriver',
    'zarabotki.ru',
    'smi2.ru',
    'openstat.net',
    'index.ru',
    'contentinsights.com',
    'ulogin.ru',
    'vdna-assets',
    'youtube',
    'adwired.mobi',
    'adriver.ru',
    'mediametrics.ru',
    'i-vengo.com',
    'connect.ok.ru',
    'twitter.com',
    'riseteam.ru',
    'yandex.ru',
    'yandexad',
    'marketgid',
    'teads.tv',
    'top100.ru',
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
                setTimeout(set_end_time(new Date()), 500);

                function set_end_time(time) {
                    var allowed = report.requests.allowed[res.url];
                    if (!allowed || !allowed.start) {
                        return;
                    }

                    allowed.end = time;
                    allowed.elapsed_time = allowed.end - allowed.start;
                    report.requests.allowed[res.url] = allowed;
                }
            }
        }).catch(function(exc) {
            console.log(exc);
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

        // TODO optimize it in future O(n)
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

        // for (var header in requestData.headers) {
        //     if (requestData.headers[header].name.indexOf('Accept') > -1) {
        //         if(requestData.headers[header].value.indexOf('text/css') > -1) {
        //             console.log('---', requestData.url);
        //             console.log(requestData.id);
        //             console.log(requestData.method);
        //             console.log(requestData.headers, requestData.id, requestData.method, requestData.time);
        //             console.log(networkRequest);
        //             // networkRequest.abort();
        //         }
        //     }
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
            report.requests.allowed[requestData.url] = {};
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
        }).catch(reject);
    });
};

module.exports = Webpage;
