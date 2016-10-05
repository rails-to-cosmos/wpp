'use strict';

function PhantomJSSettings() {
    let default_settings = new Map();
    default_settings.set('--disk-cache', 'false');
    default_settings.set('--load-images', 'false');
    default_settings.set('--cookies-file', '/dev/null');
    default_settings.set('--ignore-ssl-errors', 'true');
    default_settings.set('--ssl-protocol', 'any');
    // default_settings.set('--debug', 'true');
    this.settings = default_settings;
}

PhantomJSSettings.prototype.set = function(key, value) {
    return this.settings.set(key, value);
};

PhantomJSSettings.prototype.get_phantomjs_settings = function() {
    let adapted_phantom_settings = [];
    this.settings.forEach(function(value, key) {
        adapted_phantom_settings.push(key + '=' + value);
    });
    return adapted_phantom_settings;
};

module.exports = PhantomJSSettings;
