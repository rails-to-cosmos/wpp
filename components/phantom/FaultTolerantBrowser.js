'use strict';

const phantom = require('phantom');

function PhFTWrapper(settings) {
  this.uses_count = 0;
  this.phantom = null;
  this.in_progress = 0;
  this.settings = settings;
  this.release_when_noone_using_me = false;
}

PhFTWrapper.prototype.create = function() {
  let PJSW = this;
  return new Promise(function(resolve, reject) {
    phantom.create(PJSW.settings).then(function(ph) {
      PJSW.phantom = ph;
      resolve(ph);
    }, reject);
  });
};

PhFTWrapper.prototype.go_to_rest = function() {
  this.release_when_noone_using_me = true;
  if (this.in_progress == 0) {
    this.free();
  }
};

PhFTWrapper.prototype.acquire = function() {
  this.uses_count++;
  this.in_progress++;
  // console.log('Acquired', this.in_progress);
  return this;
};

PhFTWrapper.prototype.release = function() {
  this.in_progress--;
  // console.log('Released', this.in_progress);

  if (this.release_when_noone_using_me && this.in_progress == 0) {
    this.free();
  }
};

PhFTWrapper.prototype.free = function() {
  try {
    this.phantom.process.kill();
  } catch (exc) {
    // cannot kill phantom
  }
};

// Fault-Tolerance Phantom Instance
function FaultTolerantBrowser(settings) {
  this.max_uses_count = 50;
  this.wheelhorse = null;
  this.graveyard = [];
  this.settings = settings;
};

FaultTolerantBrowser.prototype.acquire = function() {
  let FTPh = this;

  return new Promise(function(resolve, reject) {
    if (FTPh.wheelhorse) {
      if (FTPh.wheelhorse.uses_count < FTPh.max_uses_count) {
        // console.log('Main strategy', FTPh.wheelhorse.uses_count, 'of', FTPh.max_uses_count);
        resolve(FTPh.wheelhorse.acquire());
        return;
      } else {
        // console.log('Horse goes to rest...');
        FTPh.wheelhorse.go_to_rest();
        FTPh.wheelhorse.uses_count = 1;
        FTPh.graveyard.push(FTPh.wheelhorse);
      }
    }

    FTPh.wheelhorse = new PhFTWrapper(FTPh.settings);
    FTPh.wheelhorse.create().then(function() {
      resolve(FTPh.wheelhorse.acquire());
    }, reject);
  });
};

FaultTolerantBrowser.prototype.free = function() {
  if (this.wheelhorse) {
    this.wheelhorse.free();
  }

  for (let grave of this.graveyard) {
    grave.free();
  }

  this.graveyard = [];
};

module.exports = FaultTolerantBrowser;
