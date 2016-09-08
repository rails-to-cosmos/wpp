var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionClose() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionClose.prototype = new Action();

ActionClose.prototype.main = function (subactions) {
  var ACTION = this;

  Action.prototype.main.call(this, subactions);

  var pages = ACTION.get_from_store(ACTION.get_target());

  return new Promise(function(resolve, reject) {
    var actions = pages.map(function(page) {
      return new Promise(function(resolveAction, rejectAction) {
        page.close().then(resolveAction, rejectAction);
      });
    });

    Promise.all(actions).then(function(result) {
      ACTION.run_subactions(subactions).then(resolve, reject);
    }, reject);

  });
};

module.exports = ActionClose;
