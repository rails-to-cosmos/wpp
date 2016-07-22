var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionClick() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClick.prototype = new Action();

ActionClick.prototype.main = function() {
  var STORE = this.store,
      CONFIG = this.config;

  return new Promise(function(resolve, reject) {
    var pages = STORE.get(CONFIG.target);
    var selector = CONFIG.data.selector;
    var urls = [];
    var clicked_elements_count = 0;
    var navigated_elements_count = 0;

    var requested_resources = new Set();
    var received_resources = new Set();

    var actions = pages.map(function(page) {
      return new Promise(function(resolveClick) {
        function resolveTrigger() {
          if (requested_resources.size == received_resources.size) {
            console.log('');
            console.log('Requested:', requested_resources);
            console.log('Received:', received_resources);

            // STORE.push(CONFIG.name, urls, true);
            resolveClick();
          }
        }

        // page.on('onNavigationRequested', function(status) {
        //   // urls.push(status);
        //   // navigated_elements_count++;
        //   // console.log('NavigationRequested: ' + status);
        //   // console.log(clicked_elements_count, navigated_elements_count);
        //   // resolveTrigger();
        // });

        page.on('onResourceRequested', function(requestData, networkRequest) {
          requested_resources.add(requestData.url);
        });

        page.on('onResourceReceived', function(responseData, networkRequest) {
          if (responseData.stage == 'start') {
            requested_resources.add(responseData.url);
          }

          if (responseData.stage == 'end') {
            received_resources.add(responseData.url);
            resolveTrigger();
          }
        });

        page.evaluate(function(selector) {
          function click(el) {
            var mouse_event = document.createEvent('MouseEvents');
            mouse_event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            el.dispatchEvent(mouse_event);
          }

          var elements = document.querySelectorAll(selector);
          for (var ei=0; ei<elements.length; ei++) {
            click(elements[ei]);
          }

          return elements.length;
        }, selector).then(function(ce_count) {
          clicked_elements_count = ce_count;
        });
      });
    });

    Promise.all(actions).then(() => {
      resolve();
    });
  });
};

module.exports = ActionClick;
