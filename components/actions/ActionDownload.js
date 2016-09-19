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

ActionDownload.prototype.close = function(page) {
  this.logger.info('Close page ' + page.target);
  try {
    let __free__ = function() {
      page.stop();
      page.close();
      page = null;
    };
    page.invokeMethod('clearMemoryCache').then(__free__, __free__);
  } catch (exc) {
    this.logger.error('Unable to close page:', exc);
  }
};

ActionDownload.prototype.main = function(subactions) {
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
                    ACTION.close(page);
                    resolve(result);
                  }, function(exc) {
                    ACTION.close(page);
                    reject(exc);
                  });
                } catch (exc) {
                  ACTION.close(page);
                  reject(exc);
                }
              }, function(exc) {
                ACTION.close(page);
                reject(exc);
              });
            } catch (exc) {
              ACTION.close(page);
              reject(exc);
            }
          }, function(exc) {
            context_transfered_to_main_thread = true;
            ACTION.close(page);
            reject(exc);
          });

          setTimeout(function() {
            if (!context_transfered_to_main_thread) {
              ACTION.close(page);
              reject(new Error('PhantomJS process does not responding'));
            }
          }, 120000);
        } catch (exc) {
          ACTION.close(page);
          reject(exc);
        }
      }, reject);
    } catch (exc) {
      reject(exc);
    }
  });
};

module.exports = ActionDownload;
