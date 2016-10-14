'use strict';

var assert = require('assert'),
    is_array = require('../utils/TypeHints').is_array;

function Action(factory, config, store, browser, defaults) {
    this.factory = factory;
    this.config = config || {
        name: null,
        target: null,
        data: {},
        settings: {}
    };
    this.store = store;
    this.browser = browser;
    this.history = new Map();
    this.logger = null;
    this.$scope = {};

    if (defaults) {
        if (!('settings' in this.config)) {
            this.config.settings = {};
        }

        for (let key of Object.keys(defaults)) {
            if (!(key in this.config.settings)) {
                this.config.settings[key] = defaults[key];
            }
        }
    }
};

Action.prototype.get_settings = function() {
    return this.config.settings;
};

Action.prototype.get_data = function() {
    return this.config.data;
};

Action.prototype.get_browser = function() {
    return this.browser;
};

Action.prototype.get_from_store = function(value) {
    return this.store.get(value);
};

Action.prototype.write_to_store = function(value) {
    return this.store.write(this.get_name(), value, this.is_visible());
};

Action.prototype.push_to_store = function(value) {
    return this.store.push(this.get_name(), value, this.is_visible());
};

Action.prototype.get_name = function() {
    return this.config.name;
};

Action.prototype.get_selector = function() {
    return this.get_data().$ || this.get_data().selector; // selector is deprecated
};

Action.prototype.get_target = function() {
    return this.config.target;
};

Action.prototype.is_visible = function() {
    return this.config.settings && this.config.settings.visible;
};

Action.prototype.finalize = function() {
    var ACTION = this;
    return new Promise(function(resolve, reject) {
        resolve({
            data: ACTION.store.get_visible_data(),
            history: ACTION.history
        });
    });
};

Action.prototype.console_info = function() {
    let args = Array.prototype.slice.call(arguments),
        msg = args.join(' ');

    this.logger.info(msg);
};

Action.prototype.console_debug = function() {
    let args = Array.prototype.slice.call(arguments),
        msg = args.join(' ');

    this.logger.debug(msg);
};

Action.prototype.console_error = function(message, exception) {
    this.logger.error(message, exception);
};

Action.prototype.run_subactions = function(subactions) {
    let clone = subactions.slice(),
        head = clone[0],
        tail = clone.slice().splice(1, clone.length);

    try {
        assert(is_array(subactions));
        assert.notEqual(subactions.length, 0);
    } catch (exc) {
        return this.finalize();
    }

    this.console_info('(' + this.get_name(), '(' + head.get_name(), '(' + head.get_target() + ')))');
    this.factory.inherit(head, this);
    return head.main(tail);
};

Action.prototype.main = function(subactions) {
    this.history.set(this.get_name(), this);
};

module.exports = Action;
