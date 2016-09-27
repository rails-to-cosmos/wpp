'use strict';

let chai = require('chai'),
    cheerio = require('cheerio'),
    expect = chai.expect,
    ActionParse = require('../components/actions/ActionParse'),
    ComplexSelector = require('../components/webpage/ComplexSelector');

describe('ActionParse', function() {
    // it('should be obtained from factory', function() {
    //     let actions = [],
    //         store = new ActionResultStore(),
    //         factory = new ActionFactory(null, store),
    //         tree = new ActionTree(actions, factory, null);
    // });

    it('should build complex selector', function() {
        let ap = new ActionParse(),
            ts = 'a[href]',
            cs1 = new ComplexSelector(),
            cs2 = ap.build_selector(ts);

        cs1.build(ts);

        expect(cs1.selector).to.equal(cs2.selector);
        expect(cs1.attribute).to.equal(cs2.attribute);
    });

    it('should get element by complex selector', function() {
        let ap = new ActionParse(),
            cs = ap.build_selector('a[href]'),
            $ = cheerio.load('<html><body><a href="hey">hello</div></body></html>');

        let res = ap.get_element_by_complex_selector($, cs);
        expect(res.attribs.href).to.equal('hey');
    });

    // it('should parse page by selector', function() {
    //     let ap = new ActionParse();
    //     expect(ap.parse_by_complex_selector(selector, page)).to.equal('hello hello');
    // });

});
