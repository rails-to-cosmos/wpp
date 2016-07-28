var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

// Click Element Searching Strategies
const CELS_SELECTOR = 1;
const CELS_XPATH = 2;


function ActionClickOneElement() {
  Action.apply(this, Array.prototype.slice.call(arguments));

  this.strategy = CELS_SELECTOR;

  if (this.config.data.xpath) {
    this.strategy = CELS_XPATH;
  }
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

  var pages = ACTION.get_from_store(ACTION.get_target());

  var path;

  switch(this.strategy) {
  case CELS_SELECTOR:
    path = ACTION.get_selector();
    break;
  case CELS_XPATH:
    path = ACTION.get_xpath();
    break;
  default:
    // raise exception
    path = ACTION.get_selector();
    break;
  }

  console.log('CLICK ON ONE ELEMENT:', path);

  return new Promise(function(resolveAllPages) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolve) {
        // Get elements for Click
        // For each spawn OneElementClick action
        // Add spawned actions to subactions stack
        ACTION.push_to_store(page);
        ACTION.run_subactions(subactions).then(function(result) {
          resolve(result);
        });
      });
    });

    Promise.all(actions).then(function(result) {
      // get only first result
      // to avoid duplicate pointer to datastorage in result
      resolveAllPages(result[0]);
    });
  });

  // for(var page of pages) {
  //   return new Promise(function(resolve) {
  //     ACTION.run_subactions(subactions).then(resolve);
      // page.evaluate(function(selector) {

      //   var result = {};
      //   var elements = document.querySelectorAll(selector);
      //   for (var ei=0; ei<elements.length; ei++) {
      //     if (result[xpath(elements[ei])]) {
      //       result[xpath(elements[ei])]++;
      //     } else {
      //       result[xpath(elements[ei])] = 1;
      //     }
      //   }

      //   return result;
      // }
      //               , selector).then(function(result) {
      //   console.log('here');
      //   clickons[page.target] = new Set();
      //   for (var clickon in result) {
      //     clickons[page.target].add(clickon);
      //   }
      //   console.log(clickons);
      //   resolve();
      // });
    // });
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

module.exports = ActionClickOneElement;
