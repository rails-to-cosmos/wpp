var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionStore() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionStore.prototype = new Action();

ActionStore.prototype.main = function (subactions) {
  var ACTION = this;

  Action.prototype.main.call(this, subactions);

  return new Promise(function(resolve, reject) {
    ACTION.push_to_store(ACTION.config.data);
    ACTION.run_subactions(subactions).then(function(result) {
      resolve(result);
    });
  });
};

module.exports = ActionStore;
