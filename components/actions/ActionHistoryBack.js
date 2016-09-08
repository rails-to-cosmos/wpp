var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionHistoryBack() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionHistoryBack.prototype = new Action();

ActionHistoryBack.prototype.main = function (subactions) {
  var ACTION = this;

  Action.prototype.main.call(this, subactions);

  return new Promise(function(resolve, reject) {
    ACTION.run_subactions(subactions).then(resolve, reject);
  });
};

module.exports = ActionHistoryBack;
