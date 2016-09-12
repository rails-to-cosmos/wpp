'use strict';

var Logger = require('./Logger'),
    LogstashClient = require('logstash-client');

function LogstashLogger(host, port) {
  Logger.apply(this, []);

  this.client = new LogstashClient({
    type: 'udp',
    host: host,
    port: port
  });

  this.project_name = 'Default project name';
  this.type = 0;
  this.job_id = 0;
  this.job_type = 'default job type';
  this.url = 'default url';
}

LogstashLogger.prototype = new Logger();

LogstashLogger.prototype.send_message = function(message) {
  return this.client.send(message);
};

LogstashLogger.prototype.get_default_params = function() {
  return {
    '@version': '1',
    '@timestamp': new Date(),
    level: 'INFO',
    type: this.type,
    project_name: this.project_name,
    job_id: this.job_id,
    job_type: this.job_type,
    url: this.url
  };
};

LogstashLogger.prototype.info = function(message) {
  let _package = this.get_default_params();
  _package.message = message;
  _package.level = 'INFO';
  this.send_message(_package);
};

LogstashLogger.prototype.error = function(message, exception) {
  let _package = this.get_default_params();
  _package.message = message + ' ' + exception.message;
  _package.level = 'ERROR';
  _package.path = exception.fileName;
  _package.stack_trace = exception.trace;
  _package.lineno = exception.lineNumber;
  _package.error_type = exception.name;
  this.send_message(_package);
};

LogstashLogger.prototype.debug = function(message) {
  let _package = this.get_default_params();
  _package.message = message;
  _package.level = 'DEBUG';
  this.send_message(_package);
};

module.exports = LogstashLogger;
