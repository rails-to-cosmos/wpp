var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    Filters = require('../webpage/Filters'),

    jQueryInjection = require('../injections/jQueryInjection'),

    fs = require('fs'),
    is_array = require('../utils/TypeHints').is_array,
    get_page_content = require('../webpage/Utils').get_page_content;;

function ActionDownload() {
  Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new Action();

ActionDownload.prototype.get_url = function() {
  return this.config.data.url;
};

// TODO refactor filters
ActionDownload.prototype.get_filters = function() {
  var filters = {};

  if (this.config.settings && this.config.settings.filters) {
    filters = this.config.settings.filters;
  }

  return filters;
};

ActionDownload.prototype.main = function (subactions) {
  var ACTION = this;

  return new Promise(function(resolve, reject) {
    var webpage = new Webpage(ACTION.get_browser());

    webpage.create().then(function(page) {
      var filters = ACTION.get_filters();
      if (filters) {
        Filters.applyFiltersOnPage(page, filters);
      }

      page.open(ACTION.get_url()).then(function(status) {
        get_page_content(page, ACTION).then(function(content) {
          ACTION.write_to_store(page);
          ACTION.run_subactions(subactions).then(function(result) {
            resolve(result);
          });
        });
      });
    });
  });
};

module.exports = ActionDownload;
