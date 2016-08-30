var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),

    XPathInjection = require('../injections/XPathInjection'),
    ClickInjection = require('../injections/ClickInjection'),

    fs = require('fs'),
    get_page_content = require('../webpage/Utils').get_page_content;

function ActionClickSlave() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickSlave.prototype = new Action();

ActionClickSlave.prototype.main = function (subactions) {
  const ACTION = this,
        path = ACTION.config.data.xpath,
        pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolveClick) {
        const WS_UNDEFINED = 0;
        const WS_PAGE_LOADING = 1;
        const WS_JQUERY_ACTIVE_AJAXES = 2;
        var wait_strategy = WS_UNDEFINED;

        var subactions_running_mutex = 1;
        var try_to_run_subactions = function() {
          if (subactions_running_mutex == 0) {
            return;
          }

          subactions_running_mutex = 0; // lock mutex
          ACTION.run_subactions(subactions).then(function(result) {
            resolveClick(result);
          });
        };

        page.off('onLoadStarted');
        page.on('onLoadStarted', function(status) {
          // load may be started many times
          if (wait_strategy == WS_UNDEFINED) {
            wait_strategy = WS_PAGE_LOADING;
          }
        });

        page.off('onLoadFinished');
        page.on('onLoadFinished', function(status) {
          if (wait_strategy == WS_PAGE_LOADING) {
            try_to_run_subactions();
          }
        });

        var xpath_module = new XPathInjection();
        var click_module = new ClickInjection();
        xpath_module.apply(page).then(function() {
          click_module.apply(page).then(function() {
            page.evaluate(function(path) {
              try {
                var element = __wpp__.get_element_by_xpath(path);
                __wpp__.click(element);
              } catch (err) {
                return false;
              }
              return element.outerHTML;
            }, path).then(function (result) {
              if (!result) {
                console.error('Unable to click', path, ACTION.get_name(), 'on', ACTION.config.target);
                ACTION.finalize().then(function(result) {
                  resolveClick(result);
                });
              }

              var wait_if_needed = function() {
                if (wait_strategy == WS_UNDEFINED) {
                  wait_strategy = WS_JQUERY_ACTIVE_AJAXES;
                } else {
                  return;
                }

                const waiting_limit = 10;
                var current_try = 0;

                var wait_for_active_requests = function() {
                  return new Promise(function(resolveActiveRequests) {
                    page.evaluate(function() {
                      try {
                        return $.active;
                      } catch (err) {
                        return 0;
                      }
                    }).then(function(active_requests) {
                      if(active_requests > 0 && current_try < waiting_limit) {
                        var resolver = function() {
                          wait_for_active_requests().then(resolveActiveRequests);
                        };
                        setTimeout(resolver, 500);
                        current_try++;
                      } else {
                        resolveActiveRequests();
                      }
                    });
                  });
                };

                wait_for_active_requests().then(function() {
                  var filename = ACTION.get_name();
                  console.time('render');
                  page.render('render/' + filename + '.html').then(function() {
                    console.timeEnd('render');
                  });
                  try_to_run_subactions();
                });
              };

              setTimeout(wait_if_needed, 100);
            });
          });
        });
      });
    });

    Promise.all(actions).then(function(result) {
      resolveAllPages(result);
    });
  });
};

module.exports = ActionClickSlave;
