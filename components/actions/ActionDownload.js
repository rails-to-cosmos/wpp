'use strict';

var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    Filters = require('../webpage/Filters'),

    assert = require('assert'),
    get_page_content = require('../webpage/Utils').get_page_content;

function ActionDownload() {
  Action.apply(this, Array.prototype.slice.call(arguments));
};

ActionDownload.prototype = new Action();

// TODO refactor filters
ActionDownload.prototype.get_filters = function() {
  let filters = {};

  if (this.config.settings && this.config.settings.filters) {
    filters = this.config.settings.filters;
  }

  return filters;
};

ActionDownload.prototype.main = function (subactions) {
  const ACTION = this;

  return new Promise(function(resolve, reject) {
    try {
      let webpage = new Webpage(ACTION.get_browser());
      webpage.create().then(function(page) {
        try {
          let filters = ACTION.get_filters();
          Filters.applyOnPage(page, filters);
          let url = ACTION.config.data.url;
          assert(url);

          let context_transfered_to_main_thread = false;
          page.open(url).then(function(status) {
            try {
              context_transfered_to_main_thread = true;
              get_page_content(page, ACTION).then(function(content) {
                try {
                  ACTION.write_to_store(page);
                  ACTION.run_subactions(subactions).then(function(result) {
                    resolve(result);
                  }, reject);
                } catch (exc) {
                  reject(exc);
                }
              }, reject);
            } catch (exc) {
              reject(exc);
            }
          }, function(exc) {
            context_transfered_to_main_thread = true;
            reject(exc);
          });

          setTimeout(function() {
            if (!context_transfered_to_main_thread) {
              let phantom = ACTION.get_browser();
              phantom.process.kill();
              reject(new Error('PhantomJS process does not responding'));
            }
          }, 500);
        } catch (exc) {
          reject(exc);
        }
      }, reject);
    } catch (exc) {
      reject(exc);
    }
  });
};

module.exports = ActionDownload;
