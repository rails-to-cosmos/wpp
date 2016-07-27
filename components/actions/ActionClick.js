var Action = require('./Action'),
    Webpage = require('../webpage/Webpage'),
    sleep = require('sleep');

function ActionClick() {
  Action.apply(this, Array.prototype.slice.call(arguments));

  this.async = false;
}

ActionClick.prototype = new Action();

ActionClick.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionClick.prototype.main = function* () {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  var ACTION = this;

  var pages = ACTION.get_from_store(ACTION.get_target());
  var selector = ACTION.get_selector();

  var clickons = {};

  for(var page of pages) {
    yield new Promise(function(resolve) {
      page.evaluate(function(selector){
        var xpath = function(node) {
          if (node && node.id)
            return '//*[@id="' + node.id + '"]';
          else
            return getNodeTreeXPath(node);
        };

        var getNodeTreeXPath = function(node) {
          var paths = [];
          for (; node && (node.nodeType == 1 || node.nodeType == 3) ; node = node.parentNode)  {
            var index = 0;
            if (node && node.id) {
              paths.splice(0, 0, '/*[@id="' + node.id + '"]');
              break;
            }
            for (var sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
              if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

              if (sibling.nodeName == node.nodeName)
                ++index;
            }
            var tagName = (node.nodeType == 1 ? node.nodeName.toLowerCase() : "text()");
            var pathIndex = (index ? "[" + (index+1) + "]" : "");
            paths.splice(0, 0, tagName + pathIndex);
          }
          return paths.length ? "/" + paths.join("/") : null;
        };

        var result = {};
        var elements = document.querySelectorAll(selector);
        for (var ei=0; ei<elements.length; ei++) {
          if (result[xpath(elements[ei])]) {
            result[xpath(elements[ei])]++;
          } else {
            result[xpath(elements[ei])] = 1;
          }
        }

        return result;
      }, selector).then(function(result) {
        console.log('here');
        clickons[page.target] = new Set();
        for (var clickon in result) {
          clickons[page.target].add(clickon);
        }
        console.log(clickons);
        resolve();
      });
    });
  }

  // for (var page of pages) {
  // }

  // yield new Promise(function(resolve, reject) {
  //   var requested_resources = new Set(),
  //       received_resources = new Set();

  //   var actions = pages.map(function(page) {
  //     return new Promise(function(resolveClick) {
  //       function resolveTrigger() {
  //         if (requested_resources.size == received_resources.size) {
  //           ACTION.push_to_store(page);
  //           resolveClick();
  //         }
  //       }

  //       page.on('onResourceRequested', function(requestData, networkRequest) {
  //         console.log('Click url requested:', requestData.url);
  //         requested_resources.add(requestData.url);
  //       });

  //       page.on('onResourceReceived', function(responseData, networkRequest) {
  //         if (responseData.stage == RSTAGE_START) {
  //           requested_resources.add(responseData.url);
  //         }

  //         if (responseData.stage == RSTAGE_END) {
  //           received_resources.add(responseData.url);
  //           console.log('Click resolved');
  //           resolveTrigger();
  //         }
  //       });

  //       page.evaluate(function(selector) {
  //         function click(el) {
  //           var mouse_event = document.createEvent('MouseEvents');
  //           mouse_event.initMouseEvent('click', true, true, window,
  //                                      0, 0, 0, 0, 0,
  //                                      false, false, false, false,
  //                                      0, null);
  //           el.dispatchEvent(mouse_event);
  //         }

  //         /**
  //          * Gets an XPath for an node which describes its hierarchical location.
  //          */
  //         var xpath = function(node) {
  //           if (node && node.id)
  //             return '//*[@id="' + node.id + '"]';
  //           else
  //             return getNodeTreeXPath(node);
  //         };

  //         var getNodeTreeXPath = function(node) {
  //           var paths = [];

  //           // Use nodeName (instead of localName) so namespace prefix is included (if any).
  //           for (; node && (node.nodeType == 1 || node.nodeType == 3) ; node = node.parentNode)  {
  //             var index = 0;
  //             // EXTRA TEST FOR ELEMENT.ID
  //             if (node && node.id) {
  //               paths.splice(0, 0, '/*[@id="' + node.id + '"]');
  //               break;
  //             }

  //             for (var sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
  //               // Ignore document type declaration.
  //               if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
  //                 continue;

  //               if (sibling.nodeName == node.nodeName)
  //                 ++index;
  //             }

  //             var tagName = (node.nodeType == 1 ? node.nodeName.toLowerCase() : "text()");
  //             var pathIndex = (index ? "[" + (index+1) + "]" : "");
  //             paths.splice(0, 0, tagName + pathIndex);
  //           }

  //           return paths.length ? "/" + paths.join("/") : null;
  //         };

  //         var result = {};
  //         var elements = document.querySelectorAll(selector);
  //         for (var ei=0; ei<elements.length; ei++) {
  //           click(elements[ei]);

  //           if (result[xpath(elements[ei])]) {
  //             result[xpath(elements[ei])]++;
  //           } else {
  //             result[xpath(elements[ei])] = 1;
  //           }

  //         }

  //         return result;
  //       }, selector).then(function(elements) {
  //         console.log('Elements:', elements);
  //       });
  //     });
  //   });

  //   Promise.all(actions).then(function() {
  //     resolve();
  //   });
  // }
  //);
};

module.exports = ActionClick;
