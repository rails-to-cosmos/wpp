'use strict';

var assert = require('assert'),
    is_array = require('../utils/TypeHints').is_array;

function Action(factory, config, store, browser) {
  this.factory = factory;
  this.config = config;
  this.store = store;
  this.browser = browser;
  this.history = new Map();
  this.logger = null;
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
  return this.config.name.replace(/\r?\n|\r/g, '').replace(/\s/g, '');
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
    try {
      resolve({
        data: ACTION.store.get_visible_data(),
        history: ACTION.history
      });
    } catch (exc) {
      reject(exc);
    }
  });
};

Action.prototype.console_info = function() {
  let args = Array.prototype.slice.call(arguments),
      msg = args.join(' ');

  try {
    this.logger.info(msg);
  } catch (exc) {
    console.log(msg);
  }
};

Action.prototype.console_debug = function() {
  let args = Array.prototype.slice.call(arguments),
      msg = args.join(' ');

  try {
    this.logger.debug(msg);
  } catch (exc) {
    console.log(msg);
  }
};

Action.prototype.console_error = function(message, exception) {
  try {
    this.logger.error(message, exception);
  } catch (exc) {
    console.log(message, exception);
  }
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

  this.console_info('(' + this.get_name(), '(' + head.get_name(), '(' + head.config.target + ')))');
  this.factory.inherit(head, this);
  return head.main(tail);
};

Action.prototype.main = function(subactions) {
  this.history.set(this.get_name(), this);
};

module.exports = Action;
