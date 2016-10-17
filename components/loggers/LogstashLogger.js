'use strict';

var Logger = require('./Logger'),
    LogstashClient = require('logstash-client');

function LogstashLogger(host, port) {
    Logger.apply(this, []);

    this.__slots__ = ['type', 'project_name', 'job_id', 'job_type', 'url', 'severity'];

    this.__client__ = new LogstashClient({
        type: 'udp',
        host: host,
        port: port
    });
}

LogstashLogger.prototype = new Logger();

LogstashLogger.prototype.send_message = function(message) {
    return this.__client__.send(message);
};

LogstashLogger.prototype.info = function(message) {
    let _package = this.get_default_params();
    _package.message = message;
    _package.severity = 'INFO';
    this.send_message(_package);
};

LogstashLogger.prototype.error = function(message, exception) {
    let _package = this.get_default_params();
    _package.message = message + ' ' + exception.message;
    _package.severity = 'ERROR';
    _package.path = exception.fileName;
    _package.stack_trace = exception.trace;
    _package.lineno = exception.lineNumber;
    _package.error_type = exception.name;
    this.send_message(_package);
};

LogstashLogger.prototype.debug = function(message) {
    let _package = this.get_default_params();
    _package.message = message;
    _package.severity = 'DEBUG';
    this.send_message(_package);
};

module.exports = LogstashLogger;
