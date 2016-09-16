'use strict';

const os = require('os'),
      phantom = require('phantom'),
      assert = require('assert');

function PhantomJSBalancer(settings) {
  this.phantom_processes = [];
  this.phantom_process_index = 0;
}

PhantomJSBalancer.prototype.adapt_settings = function(settings) {
  let adapted_phantom_settings = [];
  settings.forEach(function(value, key) {
    adapted_phantom_settings.push(key + '=' + value);
  });
  return adapted_phantom_settings;
};

PhantomJSBalancer.prototype.move_phantom_process_index = function() {
  if (++this.phantom_process_index >= os.cpus().length) {
    this.phantom_process_index = 0;
  }
};

PhantomJSBalancer.prototype.free = function() {
  for (let phjs of this.phantom_processes) {
    if (phjs.process) {
      phjs.process.kill();
    }
  }
};

PhantomJSBalancer.prototype.get_phantom_instance = function(settings) {
  let BALANCER = this,
      phantom_settings = BALANCER.adapt_settings(settings);

  return new Promise(function(resolve, reject) {
    let cached_ph = BALANCER.phantom_processes[BALANCER.phantom_process_index];

    if (cached_ph && cached_ph.process) {
      if (cached_ph.process._handle){
        try {
          BALANCER.move_phantom_process_index();
          resolve(BALANCER.phantom_processes[BALANCER.phantom_process_index]);
        } catch (exc) {
          reject(exc);
        }
      } else {
        BALANCER.phantom_processes[BALANCER.phantom_process_index] = null;
        phantom.create(phantom_settings).then(function(phantom_instance) {
          BALANCER.phantom_processes[BALANCER.phantom_process_index] = phantom_instance;
          resolve(phantom_instance);
        }, function(exc) { // cannot create phantom instance
          reject(exc);
        });
      }
    } else {
      phantom.create(phantom_settings).then(function(phantom_instance) {
        BALANCER.phantom_processes.push(phantom_instance);
        try {
          BALANCER.move_phantom_process_index();
          resolve(phantom_instance);
        } catch (exc) {
          reject(exc);
        }
      }, function(exc) { // cannot create phantom instance
        reject(exc);
      });
    }
  });
};

module.exports = PhantomJSBalancer;
