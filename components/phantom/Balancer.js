'use strict';

const os = require('os'),
      phantom = require('phantom'),
      assert = require('assert'),
      FaultTolerantBrowser = require('./FaultTolerantBrowser'),
      phantom_max_count = os.cpus().length;

function Balancer(settings) {
  this.browsers = [];
  this.browser_index = 0;
}

Balancer.prototype.move_browser_index = function() {
  if (++this.browser_index >= phantom_max_count) {
    this.browser_index = 0;
  }
};

Balancer.prototype.free = function() {
  for (let phjs of this.browsers) {
    phjs.free();
  }
};

Balancer.prototype.phjs_settings_adapt = function(settings) {
  let adapted_phantom_settings = [];
  settings.forEach(function(value, key) {
    adapted_phantom_settings.push(key + '=' + value);
  });
  return adapted_phantom_settings;
};

Balancer.prototype.acquire_phantom_instance = function(settings) {
  let adapted_phantom_settings = this.phjs_settings_adapt(settings);
  if (!this.browsers[this.browser_index]) {
    let browser = new FaultTolerantBrowser(adapted_phantom_settings);
    this.browsers.push(browser);
  }

  let ph = this.browsers[this.browser_index].acquire();

  this.move_browser_index();

  return ph;
};

module.exports = Balancer;
