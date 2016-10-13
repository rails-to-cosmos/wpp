'use strict';

const os = require('os'),
      FaultTolerantBrowser = require('./FaultTolerantBrowser'),
      PHANTOM_MAX_COUNT = os.cpus().length;

function Balancer(settings) {
    this.bros = [];
    this.bro_index = 0;
}

Balancer.prototype.acquire_phantom_instance = function(settings) {
    if (!this.bros[this.bro_index]) {
        let bro = new FaultTolerantBrowser(settings);
        this.bros[this.bro_index] = bro;
    }

    let ph = this.bros[this.bro_index].acquire();
    this.move_bro_index();

    return ph;
};

Balancer.prototype.move_bro_index = function() {
    if (++this.bro_index >= PHANTOM_MAX_COUNT) {
        this.bro_index = 0;
    }
};

Balancer.prototype.free = function() {
    for (let bro of this.bros) {
        bro.rip();
    }
};

module.exports = Balancer;
