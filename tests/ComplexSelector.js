'use strict';

let chai = require('chai'),
    expect = chai.expect,
    ComplexSelector = require('../components/webpage/ComplexSelector');

describe('ComplexSelector', function() {
  it('should split selector and attribute', function() {
    let cs = new ComplexSelector();
    cs.build('a[href]');
    expect(cs.selector).to.equal('a');
    expect(cs.attribute).to.equal('href');
  });

  it('should take index from eq(...) statement', function() {
    let cs = new ComplexSelector();
    cs.build('a[href]:eq(5)');
    expect(cs.index).to.equal(5);
  });

  it('should support exclude logic', function() {
    let cs = new ComplexSelector();

    cs.build('a[href]:eq(5):exclude(span)');
    let expected_excludes = ['span'];
    for(let excl in cs.excludes) {
      expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
    }

    cs.build('a[href]:eq(5):exclude(span):exclude(div):exclude(h1)');
    expected_excludes = ['span', 'div', 'h1'];
    for(let excl in cs.excludes) {
      expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
    }

    cs.build('body>div:exclude(span)');
    expected_excludes = ['span'];
    for(let excl in cs.excludes) {
      expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
    }
  });

  it('should cut ":exclude(...)" from selector', function() {
    let cs = new ComplexSelector();

    cs.build('a:exclude(span)');
    let expected_excludes = ['span'];
    for(let excl in cs.excludes) {
      expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
    }
    expect(cs.selector).to.equal('a');
  });

});
