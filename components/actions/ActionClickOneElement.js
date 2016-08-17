var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),

    XPathInjection = require('../injections/XPathInjection'),
    ClickInjection = require('../injections/ClickInjection');

// Click Element Searching Strategies
const CELS_SELECTOR = 1,
      CELS_XPATH = 2;

function ActionClickOneElement() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickOneElement.prototype = new Action();

ActionClickOneElement.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionClickOneElement.prototype.get_xpath = function() {
  return this.config.data.xpath;
};

ActionClickOneElement.prototype.main = function (subactions) {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  var ACTION = this;

  var path = ACTION.get_xpath();

  var pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolveClick) {
        var requested_resources = new Set(),
            received_resources = new Set(),
            pending_requests = new Set(),
            resolve_started = false;

        page.off('onLoadFinished');
        page.on('onLoadFinished', function(status) {
          if (resolve_started && requested_resources.size == received_resources.size) {
            ACTION.push_to_store(page);
            ACTION.run_subactions(subactions).then(function(result) {
              resolveClick(result);
            });
          }
        });

        var xpath_module = new XPathInjection();
        var click_module = new ClickInjection();
        xpath_module.apply(page).then(function() {
          click_module.apply(page).then(function() {
            page.evaluate(function(path) {
              var element = __wpp__.get_element_by_xpath(path);
              __wpp__.click(element);
            }, path).then(function() {
              resolve_started = true;
            });
          });
        });
      });
    });

    Promise.all(actions).then(function(result) {
      // get only first result to avoid duplicate pointer to datastorage in result
      resolveAllPages(result);
    });
  });
};

module.exports = ActionClickOneElement;
