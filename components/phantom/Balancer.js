'use strict';

const os = require('os'),
      phantom = require('phantom'),
      assert = require('assert'),
      FaultTolerantBrowser = require('./FaultTolerantBrowser'),
      phantom_max_count = os.cpus().length;

function Balancer(settings) {
    this.bros = [];
    this.bro_index = 0;
}

Balancer.prototype.move_bro_index = function() {
    if (++this.bro_index >= phantom_max_count) {
        this.bro_index = 0;
    }
};

Balancer.prototype.free = function() {
    for (let bro of this.bros) {
        bro.rip();
    }
};

Balancer.prototype.acquire_phantom_instance = function(settings) {
    if (!this.bros[this.bro_index]) {
        let bro = new FaultTolerantBrowser(settings);
        this.bros[this.bro_index] = bro;
    }

    let ph = this.bros[this.bro_index].acquire();
    this.move_bro_index();

    return ph;
};

module.exports = Balancer;
