'use strict';

let chai = require('chai'),
    cheerio = require('cheerio'),
    expect = chai.expect,
    ComplexSelector = require('../components/webpage/ComplexSelector');

describe('ComplexSelector', function() {
    it('should split selector and attribute', function() {
        let cs = new ComplexSelector('a[href]');
        let sel = cs.selectors[0];
        expect(sel.selector).to.equal('a');
        expect(sel.attribute).to.equal('href');
    });

    it('should take index from eq(...) statement', function() {
        let cs = new ComplexSelector('a[href]:eq(5)');
        expect(cs.selectors[0].index).to.equal(5);
    });

    it('should support relative logic', function() {
        let $ = cheerio.load('<div><a href="foo">foo2</a><a href="bar">bar2</a></div>'),
            cs = new ComplexSelector('>a[href]'),
            elems = cs.apply($);

        expect(elems.length).to.equal(1);
        for (let elem of elems) {
            expect(elem).to.equal('foo');
        }
    });

    it('should extract attr from target element', function() {
        let $ = cheerio.load('<a href="foo">bar</a>'),
            cs = new ComplexSelector('[href]'),
            elems = cs.apply($);

        expect(elems.length).to.equal(1);
        for (let elem of elems) {
            expect(elem).to.equal('foo');
        }
    });

    it('should extract many elements', function() {
        let $ = cheerio.load('<div><a href="foo">foo</a><a href="bar">bar</a></div>'),
            cs = new ComplexSelector('div a'),
            elems = cs.apply($),
            exp = ['foo', 'bar'];

        expect(elems.length).to.equal(2);
        for (let i in elems) {
            expect(elems[i]).to.equal(exp[i]);
        }
    });

    it('should support exclude logic', function() {
        let cs = new ComplexSelector('a[href]:eq(5):exclude(span)');
        let expected_excludes = ['span'];
        expect(cs.selectors[0].excludes.length).to.equal(1);
        for(let excl in cs.excludes) {
            expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
        }

        let cs2 = new ComplexSelector('a[href]:eq(5):exclude(span):exclude(div):exclude(h1)');
        expect(cs2.selectors[0].excludes.length).to.equal(3);
        expected_excludes = ['span', 'div', 'h1'];
        for(let excl in cs2.excludes) {
            expect(cs2.excludes[excl]).to.equal(expected_excludes[excl]);
        }

        let cs3 = new ComplexSelector('body>div:exclude(span)');
        expect(cs3.selectors[0].excludes.length).to.equal(1);
        expected_excludes = ['span'];
        for(let excl in cs3.excludes) {
            expect(cs3.excludes[excl]).to.equal(expected_excludes[excl]);
        }
    });

    it('should cut ":exclude(...)" from selectors', function() {
        let cs = new ComplexSelector('a:exclude(span)');
        let expected_excludes = ['span'];
        for(let excl in cs.excludes) {
            expect(cs.selectors[0].excludes[excl]).to.equal(expected_excludes[excl]);
        }
        expect(cs.selectors[0].selector).to.equal('a');
    });

    it('should support simple selectors, separated by a comma', function() {
        let cs = new ComplexSelector('a[href],span[id]');
        expect(cs.selectors[0].selector).to.equal('a');
        expect(cs.selectors[0].attribute).to.equal('href');
        expect(cs.selectors[1].selector).to.equal('span');
        expect(cs.selectors[1].attribute).to.equal('id');
    });

    it('should concatenate results achieved by multiple selectors', function() {
        let $ = cheerio.load('<div id="main"><a href="foo">foo</a><span id="bar">bar</div></div>'),
            cs = new ComplexSelector('div a[href],div span[id]'),
            result = cs.apply($);

        for (let item of result) {
            expect(item).to.equal('foo bar');
        }
    });

});
