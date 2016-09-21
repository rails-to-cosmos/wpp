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

Balancer.prototype.acquire_phantom_instance = function(settings) {
  if (!this.browsers[this.browser_index]) {
    let browser = new FaultTolerantBrowser(settings);
    this.browsers.push(browser);
  }

  let ph = this.browsers[this.browser_index].acquire();

  this.move_browser_index();

  return ph;
};

module.exports = Balancer;
