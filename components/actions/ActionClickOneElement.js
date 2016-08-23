var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),

    XPathInjection = require('../injections/XPathInjection'),
    ClickInjection = require('../injections/ClickInjection'),

    fs = require('fs'),
    get_page_content = require('../webpage/Utils').get_page_content;

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

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
              console.log('Click successfully evaluated on element', result, 'path:', path);

              // TODO refactor. Wait for ajax, research
              setTimeout(function() {
                if (!load_started) {
                  console.log('No requests. Resolving click without calling subactions.');
                  page.render('render/' + path.hashCode() + '.png');
                  get_page_content(page).then(function(content) {
                    fs.writeFile('render/' + path.hashCode() + '.html', content);
                  });
                  ACTION.run_subactions(subactions).then(function(result) {
                    resolveClick(result);
                  });
                } else {
                  console.log('Requests has been sent.');
                }
              }, 1000);

              if (!result) {
                console.error('Unable to click', path, ACTION.config.name, '->', ACTION.config.target);
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
