var is_array = require('./utils/TypeHints').is_array;

function SyntaxValidator() {

}

SyntaxValidator.prototype.validate = function(actions) {
  if (!is_array(actions)) {
    return {
      err_code: 2,
      description: 'Actions must be an array.'
    };
  }

  var names = new Set();
  for (var action of actions) {
    if (names.has(action.name)) {
      return {
        err_code: 1,
        description: 'Action\'s name must be unique: ' + action.name + '.'
      };
    }
    names.add(action.name);
  }

  // check types:
  // click must choose one of these targets: httpresponse, download, click

  return {
    err_code: 0,
    description: 'Success.'
  };
};

module.exports = SyntaxValidator;
