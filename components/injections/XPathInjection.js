var Injection = require('./Injection');

var XPathInjection = function() {

};

XPathInjection.prototype = new Injection();

XPathInjection.prototype.code = function() {
  if (typeof __wpp__ == 'undefined') {
    __wpp__ = {};
  }

  if (__wpp__.xpath) {
    return;
  }

  __wpp__.get_element_by_xpath = function(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };

  __wpp__.xpath = function(node) {
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

    if (node && node.id)
      return '//*[@id="' + node.id + '"]';
    else
      return getNodeTreeXPath(node);
  };
};

module.exports = XPathInjection;
