var filterRequests = function(requestData, request, config) {
  var url = requestData['url'];
  var url_max_len = 100;
  if (url.length > url_max_len) {
    url = url.substring(0, url_max_len) + '...';
  }

  var whitelist = config.filters.whitelist;

  if (whitelist.hasOwnProperty('urls')) {
    var url_is_in_whitelist = false;
    whitelist.urls.forEach(function(el) {
      var re = new RegExp(el);
      if (re.test(url)) {
        url_is_in_whitelist = true;
      }
    });
    if (!url_is_in_whitelist) {
      if(config.debug && config.debug.show_aborted && config.debug.whitelist_report) {
        console.log('Request aborted (whitelist, url): ' + url);
      }
      request.abort();
      return;
    }
  }

  var blacklist = config.filters.blacklist;
  var request_aborted = false;

  if (blacklist.hasOwnProperty('urls')) {
    blacklist.urls.forEach(function(el) {
      var re = new RegExp(el);
      if (re.test(url)) {
        if(config.debug && config.debug.show_aborted && config.debug.blacklist_report) {
          console.log('Request aborted (blacklist, url): ' + el + ' ' + url);
        }

        request.abort();
        request_aborted = true;
        return;
      }
    });

    if (request_aborted) {
      return;
    }
  }

  if (blacklist.hasOwnProperty('content_types')) {
    blacklist.content_types.forEach(function(el) {
      if (el == requestData['Content-Type']) {
        if(config.debug && config.debug.show_aborted && config.debug.blacklist_report) {
          console.log('Request ' + url + ' aborted by content type (blacklist).');
        }

        request.abort();
        request_aborted = true;
        return;
      }
    });

    if (request_aborted) {
      return;
    }
  }

  if(config.debug && config.debug.show_accepted) {
    console.log('Request accepted: ' + url);
  }

};

module.exports = {
  filterRequests: function(page, config) {
    page.property('onResourceRequested', filterRequests, config);
  },
  with_jq: (page) => (page.injectJs('jquery.js')),
  is_array: (obj) => Object.prototype.toString.call( obj ) == '[object Array]',
  is_object: (obj) => Object.prototype.toString.call( obj ) == '[object Object]',
  is_string: (obj) => Object.prototype.toString.call( obj ) == '[object String]'
};
