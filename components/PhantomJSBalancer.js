'use strict';

const os = require('os'),
      phantom = require('phantom'),
      assert = require('assert'),
      FTPhantom = require('./FTPhantom'),
      phantom_max_count = os.cpus().length;

function PhantomJSBalancer(settings) {
  this.phantom_processes = [];
  this.phantom_process_index = 0;
}

PhantomJSBalancer.prototype.move_phantom_process_index = function() {
  if (++this.phantom_process_index >= phantom_max_count) {
    this.phantom_process_index = 0;
  }
};

PhantomJSBalancer.prototype.free = function() {
  for (let phjs of this.phantom_processes) {
    phjs.free();
  }
};

PhantomJSBalancer.prototype.acquire_phantom_instance = function(settings) {
  let adapted_phantom_settings = [];
  settings.forEach(function(value, key) {
    adapted_phantom_settings.push(key + '=' + value);
  });

  if (!this.phantom_processes[this.phantom_process_index]) {
    this.phantom_processes.push(new FTPhantom(adapted_phantom_settings));
  }

  let ph = this.phantom_processes[this.phantom_process_index].acquire();

  this.move_phantom_process_index();

  return ph;
};

module.exports = PhantomJSBalancer;
