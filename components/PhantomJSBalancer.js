'use strict';

const os = require('os'),
      phantom = require('phantom'),
      assert = require('assert'),
      FTPhantom = require('./FTPhantom'),
      phantom_max_count = 1;  // os.cpus().length;

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

// PhantomJSBalancer.prototype.move_phantom_process_index = function() {
//   if (++this.phantom_process_index >= phantom_max_count) {
//     this.phantom_process_index = 0;
//   }
// };

PhantomJSBalancer.prototype.free = function() {
  for (let phjs of this.phantom_processes) {
    phjs.free();
  }
};

PhantomJSBalancer.prototype.release_phantom_instance = function() {

};

PhantomJSBalancer.prototype.acquire_phantom_instance = function(settings) {
  if (!this.phantom_processes[this.phantom_process_index]) {
    this.phantom_processes.push(new FTPhantom(this.adapt_settings(settings)));
  }

  return this.phantom_processes[this.phantom_process_index].acquire();

  // return new Promise(function(resolve, reject) {
  //   resolve(BALANCER.phantom_processes[BALANCER.phantom_process_index].acquire());

  // let cached_ph = BALANCER.phantom_processes[BALANCER.phantom_process_index];

  // if (!cached_ph || !cached_ph.phantom || !cached_ph.phantom.process) {
  //   BALANCER.create_phantom(resolve, reject, phantom_settings);
  //   return;
  // }

  // if (cached_ph.phantom.process._handle) {
  //   // BALANCER.recreate_phantom(resolve, reject, phantom_settings);
  //   BALANCER.get_existing_phantom(resolve, reject);
  // } else {
  //   BALANCER.recreate_phantom(resolve, reject, phantom_settings);
  // }
  // });
};

// PhantomJSBalancer.prototype.get_existing_phantom = function(resolve, reject) {
//   try {
//     this.move_phantom_process_index();
//     let ph = this.phantom_processes[this.phantom_process_index];
//     // ph.uses++;
//     // console.log('Using existing phantom', ph.uses);
//     resolve(ph.phantom);
//   } catch (exc) {
//     reject(exc);
//   }
// };

// PhantomJSBalancer.prototype.recreate_phantom = function(resolve, reject, settings) {
//   let BALANCER = this;
//   phantom.create(settings).then(function(phantom_instance) {
//     BALANCER.phantom_processes[BALANCER.phantom_process_index] = {
//       phantom: phantom_instance,
//       uses: {
//         all: 0,
//         current: 0
//       }
//     };
//     resolve(phantom_instance);
//   }, function(exc) { // cannot create phantom instance
//     reject(exc);
//   });
// };

// PhantomJSBalancer.prototype.create_phantom = function(resolve, reject, settings) {
//   let BALANCER = this;
//   phantom.create(settings).then(function(phantom_instance) {
//     BALANCER.phantom_processes.push({
//       phantom: phantom_instance,
//       uses: {
//         all: 0,
//         current: 0
//       }
//     });
//     try {
//       BALANCER.move_phantom_process_index();
//       resolve(phantom_instance);
//     } catch (exc) {
//       reject(exc);
//     }
//   }, function(exc) { // cannot create phantom instance
//     reject(exc);
//   });
// };

module.exports = PhantomJSBalancer;
