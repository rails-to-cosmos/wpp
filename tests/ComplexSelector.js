'use strict';

let chai = require('chai'),
    cheerio = require('cheerio'),
    expect = chai.expect,
    ComplexSelector = require('../components/webpage/ComplexSelector');

describe('ComplexSelector', function() {
    it('should split selector and attribute', function() {
        let cs = new ComplexSelector();
        cs.build('a[href]');
        let sel = cs.selectors[0];
        expect(sel.selector).to.equal('a');
        expect(sel.attribute).to.equal('href');
    });

    it('should take index from eq(...) statement', function() {
        let cs = new ComplexSelector();
        cs.build('a[href]:eq(5)');
        expect(cs.selectors[0].index).to.equal(5);
    });

    it('should support relative logic', function() {
        let $ = cheerio.load('<a href="hey">hello</a>'),
            cs = new ComplexSelector('>a[id]'),
            elems = cs.apply($);

        for (let elem of elems) {
            expect(elem).to.equal('id');
        }
    });

    it('should support exclude logic', function() {
        let cs = new ComplexSelector();

        cs.build('a[href]:eq(5):exclude(span)');
        let expected_excludes = ['span'];
        expect(cs.selectors[0].excludes.length).to.equal(1);
        for(let excl in cs.excludes) {
            expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
        }

        cs.build('a[href]:eq(5):exclude(span):exclude(div):exclude(h1)');
        expect(cs.selectors[0].excludes.length).to.equal(3);
        expected_excludes = ['span', 'div', 'h1'];
        for(let excl in cs.excludes) {
            expect(cs.excludes[excl]).to.equal(expected_excludes[excl]);
        }

        cs.build('body>div:exclude(span)');
        expect(cs.selectors[0].excludes.length).to.equal(1);
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
            expect(cs.selectors[0].excludes[excl]).to.equal(expected_excludes[excl]);
        }
        expect(cs.selectors[0].selector).to.equal('a');
    });

    it('should support simple selectors, separated by a comma', function() {
        let cs = new ComplexSelector();
        cs.build('a[href],span[id]');
        expect(cs.selectors[0].selector).to.equal('a');
        expect(cs.selectors[0].attribute).to.equal('href');
        expect(cs.selectors[1].selector).to.equal('span');
        expect(cs.selectors[1].attribute).to.equal('id');
    });
});
