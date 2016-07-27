var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    Filters = require('../webpage/Filters');

function ActionDownload() {
  Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new Action();

ActionDownload.prototype.get_url = function() {
  return this.config.data.url;
};

ActionDownload.prototype.get_filters = function() {
  if (this.config.settings && this.config.settings.filters) {
    return this.config.settings.filters;
  } else {
    return 0;
  }
};

ActionDownload.prototype.main = function* () {
  var ACTION = this;

  yield new Promise(function(resolve, reject) {
    var webpage = new Webpage(ACTION.get_browser());
    webpage.create().then(function(page) {
      var filters = ACTION.get_filters();
      if (filters) {
        Filters.applyFiltersOnPage(page, filters);
      }

      page.open(ACTION.get_url()).then(function(status) {
        page.property('content').then(function(content) {
          ACTION.push_to_store(page);
          resolve(page);
        });
      });
    });
  });
};

module.exports = ActionDownload;
