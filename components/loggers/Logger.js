'use strict';

function Logger() {
    this.__slots__ = ['url', 'severity', 'message'];
}

Logger.prototype.send_message = function(message) {
    console.log(message);
};

Logger.prototype.get_default_params = function() {
    let def_params = {
        '@version': '1',
        '@timestamp': new Date(),
        'severity': 'INFO',
        'message': ''
    };

    for (let slot of this.__slots__) {
        if (this[slot]) {
            def_params[slot] = this[slot];
        }
    }

    return def_params;
};

Logger.prototype.info = function(message) {
    let _package = this.get_default_params();
    _package.message = message;
    _package.severity = 'INFO';
    this.send_message(_package);
};

Logger.prototype.error = function(message, exception) {
    let _package = this.get_default_params();
    _package.message = message + ' ' + exception.message;
    _package.severity = 'ERROR';
    _package.path = exception.fileName;
    _package.stack_trace = exception.trace;
    _package.lineno = exception.lineNumber;
    _package.error_type = exception.name;
    this.send_message(_package);
};

Logger.prototype.debug = function(message) {
    let _package = this.get_default_params();
    _package.message = message;
    _package.severity = 'DEBUG';
    this.send_message(_package);
};

module.exports = Logger;
