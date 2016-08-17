var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionHistoryBack() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionHistoryBack.prototype = new Action();

ActionHistoryBack.prototype.main = function (subactions) {
  var ACTION = this;
  return new Promise(function(resolve, reject) {
    ACTION.run_subactions(subactions).then(function(result) {
      resolve(result);
    });
  });
};

module.exports = ActionHistoryBack;
