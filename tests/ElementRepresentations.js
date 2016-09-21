'use strict';

let chai = require('chai'),
    expect = chai.expect,

    cheerio = require('cheerio'),
    ComplexSelector = require('../components/webpage/ComplexSelector'),
    ElementRepresentations = require('../components/webpage/ElementRepresentations');

describe('ElementRepresentations', function() {
  describe('#TextRepresentation', function() {
    it('should be obtained from the factory', function() {
      let cs = new ComplexSelector();
      cs.build('body>div');
      let repr = ElementRepresentations.get_representation_by_selector(cs);
      expect(new repr() instanceof ElementRepresentations.TextRepresentation).to.equal(true);
    });

    it('should extract text from element', function() {
      let cs = new ComplexSelector();
      cs.build('body>div');
      let $ = cheerio.load('<html><body><div>hello</div></body></html>');
      let repr_type = ElementRepresentations.get_representation_by_selector(cs);
      let element = $(cs.selector).get(cs.index);
      let repr = new repr_type($, element, cs);
      expect(repr.repr()).to.equal('hello');
    });

    it('should support exclude logic', function() {
      let cs = new ComplexSelector();
      cs.build('body>span>div:exclude(span)');
      let $ = cheerio.load('<html><body><span><div>hello<span>world</span></div></span></body></html>');
      let repr_type = ElementRepresentations.get_representation_by_selector(cs);
      let element = $(cs.selector).get(cs.index);
      let repr = new repr_type($, element, cs);
      expect(repr.repr()).to.equal('hello');
    });
  });

  describe('#OuterHTMLRepresentation', function() {
    it('should be obtained from the factory', function() {
      let cs = new ComplexSelector();
      cs.build('body>div[outerHTML]');
      let repr = ElementRepresentations.get_representation_by_selector(cs);
      expect(new repr() instanceof ElementRepresentations.OuterHTMLRepresentation).to.equal(true);
    });

    it('should extract outer html from element', function() {
      let cs = new ComplexSelector();
      cs.build('body>div[outerHTML]');
      let $ = cheerio.load('<html><body><div>hello</div></body></html>');
      let repr_type = ElementRepresentations.get_representation_by_selector(cs);
      let element = $(cs.selector).get(cs.index);
      let repr = new repr_type($, element, cs);
      expect(repr.repr()).to.equal('<div>hello</div>');
    });

    it('should support exclude logic', function() {
      let cs = new ComplexSelector();
      cs.build('body>span>div[outerHTML]:exclude(span)');
      let $ = cheerio.load('<html><body><span><div>hello<span>world</span></div></span></body></html>');
      let repr_type = ElementRepresentations.get_representation_by_selector(cs);
      let element = $(cs.selector).get(cs.index);
      let repr = new repr_type($, element, cs);
      expect(repr.repr()).to.equal('<div>hello</div>');
    });
  });

  describe('#AttributeRepresentation', function() {
    it('should be obtained from the factory', function() {
      let cs = new ComplexSelector();
      cs.build('[hello]');
      let repr = ElementRepresentations.get_representation_by_selector(cs);
      expect(new repr() instanceof ElementRepresentations.AttributeRepresentation).to.equal(true);
    });

    it('should extract attribute from element', function() {
      let cs = new ComplexSelector();
      cs.build('body>div[id]');
      let $ = cheerio.load('<html><body><div id="my_id">hello</div></body></html>');
      let repr_type = ElementRepresentations.get_representation_by_selector(cs);
      let element = $(cs.selector).get(cs.index);
      let repr = new repr_type($, element, cs);
      expect(repr.repr()).to.equal('my_id');
    });

    it('should support exclude logic', function() {
      let cs = new ComplexSelector();
      cs.build('body>span>div[id]');
      let $ = cheerio.load('<html><body><span><div id="hello">hello<span>world</span></div></span></body></html>');
      let repr_type = ElementRepresentations.get_representation_by_selector(cs);
      let element = $(cs.selector).get(cs.index);
      let repr = new repr_type($, element, cs);
      expect(repr.repr()).to.equal('hello');
    });
  });
});
