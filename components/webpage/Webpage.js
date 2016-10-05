function Webpage(browser, config) {
    this.browser = browser;
    this.page = null;
};

Webpage.prototype.create = function(resource_timeout, user_agent) {
    const WP = this,
          BROWSER = this.browser,
          CONFIG = this.config;

    return new Promise(function (resolve, reject) {
        BROWSER.createPage().then(function (page) {
            if (user_agent) {
                page.setting('userAgent', user_agent);
            }

            page.setting('resourceTimeout', resource_timeout);
            page.property('viewportSize', {width: 800, height: 600});

            page.on('onResourceTimeout', function(request) {
                // ignore slowpokes
                // console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
            });

            page.on('onError', function() {});
            page.on('onResourceError', function(msg, trace) {});

            WP.page = page;
            resolve(page);
        }, function(exc) {
            reject(exc);
        });
    });
};

module.exports = Webpage;
