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
      ACTION.logger.info('1');
      let webpage = new Webpage(ACTION.get_browser());
      ACTION.logger.info('2');
      webpage.create().then(function(page) {
        ACTION.logger.info('3');
        try {
          let filters = ACTION.get_filters();
          Filters.applyOnPage(page, filters);
          ACTION.logger.info('4');
          let url = ACTION.config.data.url;
          assert(url);
          ACTION.logger.info('5');
          page.invokeAsyncMethod('open', url).then(function(status) {
            ACTION.logger.info('6');
            try {
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
          }, reject);
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
