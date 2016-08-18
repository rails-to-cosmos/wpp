var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),

    XPathInjection = require('../injections/XPathInjection'),
    ClickInjection = require('../injections/ClickInjection');

function ActionClickOneElement() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClickOneElement.prototype = new Action();

ActionClickOneElement.prototype.main = function (subactions) {
  const ACTION = this,
        path = ACTION.config.data.xpath,
        pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolveClick) {
        var load_started = false;

        page.off('onLoadStarted');
        page.on('onLoadStarted', function(status) {
          load_started = true;
        });

        page.off('onLoadFinished');
        page.on('onLoadFinished', function(status) {
          if (load_started) {
            ACTION.run_subactions(subactions).then(function(result) {
              resolveClick(result);
            });
          }
        });

        // page.off('onNavigationRequested');
        // page.on('onNavigationRequested', function(url, type, willNavigate, main) {
        //   console.log('Trying to navigate to: ' + url);
        //   console.log('Caused by: ' + type);
        //   console.log('Will actually navigate: ' + willNavigate);
        //   console.log('Sent from the page\'s main frame: ' + main);
        // });

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
              return Boolean(element);
            }, path).then(function (result) {
              if (!result) {
                console.error('Unable to click on ', path, ACTION.config.name, '->', ACTION.config.target);
                ACTION.finalize().then(function(result) {
                  resolveClick(result);
                });
              }
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

module.exports = ActionClickOneElement;
