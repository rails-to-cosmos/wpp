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

  var path;

  path = ACTION.get_xpath();

  console.log('CLICK ON ONE ELEMENT:', path);

  var pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolveClick) {
        var requested_resources = new Set(),
            received_resources = new Set(),
            pending_requests = new Set(),
            resolve_started = false;

        function resolveTrigger() {
          // console.log('resolve', resolve_started, 'reqs', requested_resources.size, 'recs', received_resources.size);
          // console.log('pending', pending_requests);
          if (resolve_started && requested_resources.size == received_resources.size) {
            ACTION.push_to_store(page);
            ACTION.run_subactions(subactions).then(function(result) {
              resolveClick(result);
            });
          }
        }

        page.off('onResourceRequested');
        page.on('onResourceRequested', function(requestData, networkRequest) {
          requested_resources.add(requestData.url);
          pending_requests.add(requestData.url);
        });

        page.off('onResourceReceived');
        page.on('onResourceReceived', function(responseData, networkRequest) {
          if (responseData.stage == RSTAGE_START) {
            requested_resources.add(responseData.url);
            pending_requests.add(responseData.url);
          }

          if (responseData.stage == RSTAGE_END) {
            received_resources.add(responseData.url);
            pending_requests.delete(responseData.url);
            resolveTrigger();
          }
        });

        var xpath_module = null;
        var click_module = null;

        // ACTION.push_to_store('<PAGE from', path, '>');
        ACTION.run_subactions(subactions).then(function(result) {
          resolveClick(result);
        });

        // xpath_module = new XPathInjection();
        // click_module = new ClickInjection();

        // xpath_module.apply(page).then(function() {
        //   click_module.apply(page).then(function() {
        //     page.evaluate(function(path) {
        //       var element = window.__wpp__.get_element_by_xpath(path);
        //       window.__wpp__.click(element);
        //     }, path).then(function() {
        //       resolve_started = true;
        //     });
        //   });
        // });
      });
    });

    Promise.all(actions).then(function(result) {
      // get only first result to avoid duplicate pointer to datastorage in result
      resolveAllPages(result[0]);
    });
  });
};

module.exports = ActionClickOneElement;
