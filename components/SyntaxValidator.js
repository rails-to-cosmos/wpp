var is_array = require('./utils/TypeHints').is_array;

function SyntaxValidator() {

}

SyntaxValidator.prototype.validate = function(actions) {
  return new Promise(function(resolve, reject) {
    if (!is_array(actions)) {
      reject({
        err_code: 2,
        description: 'Actions must be an array.'
      });
      return;
    }

    var names = new Set();
    for (var action of actions) {
      if (names.has(action.name)) {
        reject({
          err_code: 1,
          description: 'Action\'s name must be unique: ' + action.name + '.'
        });
        return;
      }
      names.add(action.name);
    }

    // TODO check types (click must choose one of these targets: httpresponse, download, click)
    resolve({
      err_code: 0,
      description: 'Success.'
    });
  });
};

module.exports = SyntaxValidator;
