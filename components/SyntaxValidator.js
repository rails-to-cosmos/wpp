var is_array = require('./utils/TypeHints').is_array;

function SyntaxValidator() {

}

SyntaxValidator.prototype.validate = function(code) {
  if (!is_array(code.actions)) {
    return {
      err_code: 2,
      description: 'Actions must be array.'
    };
  }

  var names = new Set();
  for (var action of code.actions) {
    if (names.has(action.name)) {
      return {
        err_code: 1,
        description: 'Action\'s name must be unique: ' + action.name + '.'
      };
    }
    names.add(action.name);
  }

  return {
    err_code: 0,
    description: 'Success.'
  };
};

module.exports = SyntaxValidator;
