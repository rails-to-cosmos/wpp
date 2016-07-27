var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    sleep = require('sleep');

function ActionClick() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClick.prototype = new Action();

ActionClick.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionClick.prototype.main = function() {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  var ACTION = this;

  return new Promise(function(resolve, reject) {
    var pages = ACTION.get_from_store(ACTION.get_target());
    var selector = ACTION.get_selector();

    var requested_resources = new Set(),
        received_resources = new Set();

    var actions = pages.map(function(page) {
      return new Promise(function(resolveClick) {
        function resolveTrigger() {
          if (requested_resources.size == received_resources.size) {
            ACTION.push_to_store(page);
            resolveClick();
          }
        }

        page.on('onResourceRequested', function(requestData, networkRequest) {
          requested_resources.add(requestData.url);
        });

        page.on('onResourceReceived', function(responseData, networkRequest) {
          if (responseData.stage == RSTAGE_START) {
            requested_resources.add(responseData.url);
          }

          if (responseData.stage == RSTAGE_END) {
            received_resources.add(responseData.url);
            resolveTrigger();
          }
        });

        page.evaluate(function(selector) {
          function click(el) {
            var mouse_event = document.createEvent('MouseEvents');
            mouse_event.initMouseEvent('click', true, true, window,
                                       0, 0, 0, 0, 0,
                                       false, false, false, false,
                                       0, null);
            el.dispatchEvent(mouse_event);
          }

          var elements = document.querySelectorAll(selector);
          for (var ei=0; ei<elements.length; ei++) {
            click(elements[ei]);
          }

          return elements.length;
        }, selector);
      });
    });

    Promise.all(actions).then(() => {
      resolve();
    });
  });
};

module.exports = ActionClick;
