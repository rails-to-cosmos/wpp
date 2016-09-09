'use strict';

let chai = require('chai'),
    expect = chai.expect,
    WebpageProcessor = require('../components/WebpageProcessor');

describe('WebpageProcessor', function() {
  it('phantom_instance must be null if wpp not started', function() {
    var wpp = new WebpageProcessor();
    expect(wpp.phantom_instance).to.equal(null);
  });
});
