'use strict';

function Logger() {

}

Logger.prototype.send_message = function(message) {
  console.log(message);
};

Logger.prototype.get_default_params = function() {
  return {};
};

Logger.prototype.info = function(message) {
  let _package = this.get_default_params();
  _package.message = message;
  _package.level = 'INFO';
  this.send_message(_package);
};

Logger.prototype.error = function(message, exception) {
  let _package = this.get_default_params();
  _package.message = message + ' ' + exception.message;
  _package.level = 'ERROR';
  _package.path = exception.fileName;
  _package.stack_trace = exception.trace;
  _package.lineno = exception.lineNumber;
  _package.error_type = exception.name;
  this.send_message(_package);
};

Logger.prototype.debug = function(message) {
  let _package = this.get_default_params();
  _package.message = message;
  _package.level = 'DEBUG';
  this.send_message(_package);
};

module.exports = Logger;