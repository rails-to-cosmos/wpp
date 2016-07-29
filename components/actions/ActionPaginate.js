var Action = require('./Action'),
    ActionClickController = require('./ActionClickController'),
    Webpage = require('../webpage/Webpage'),
    XPathInjection = require('../injections/XPathInjection'),

    deepcopy = require('deepcopy');

function ActionPaginate() {
  ActionClickController.apply(this, Array.prototype.slice.call(arguments));
}

ActionPaginate.prototype = new ActionClickController();

ActionPaginate.prototype.main = function (subactions) {
  const RSTAGE_START = 'start',
        RSTAGE_END = 'end';

  var ACTION = this;

  var pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolvePaginate) {
    resolvePaginate();
  });

};

module.exports = ActionPaginate;
