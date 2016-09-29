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

    it('should get elements by complex selector', function() {
        let ap = new ActionParse(),
            cs = new ComplexSelector('a[href]'),
            $ = cheerio.load('<html><body><a href="hey">hello</a></body></html>');

        let elems = ap.get_elements_by_complex_selector($, cs);
        for (let elem of elems) {
            expect(elem.attribs.href).to.equal('hey');
        }
    });

    it('should clean data', function() {
        let ap = new ActionParse();
        expect(ap.clean_element_data('  hello  ')).to.equal('hello');
    });

    it('should support relative selector logic', function() {
        let ap = new ActionParse(),
            cs = new ComplexSelector('>span[id]'),
            $ = cheerio.load('<a href="hey">hello<span id="hey2">span text</span></div>');

        expect(ap.get_relative_element_data($, cs)).to.equal('hey2');
    });

    it('should get many elements properly', function() {
        let ap = new ActionParse(),
            cs = new ComplexSelector('a'),
            $ = cheerio.load('<div><a href="hey">hello</a></div><div><a id="hey2">hello2</a></div>'),
            result = ap.get_many_elements_by_cpx_selector($, cs),
            expected = ['hello', 'hello2'];

        for (let ind in result) {
            expect(result[ind]).to.equal(expected[ind]);
        }
    });

    it('should get attr from current element', function() {
        let ap = new ActionParse(),
            cs = new ComplexSelector('[id]'),
            content = '<div id="hello"><span id="hey">div</span>text</div>',
            $ = cheerio.load(content),
            result = ap.get_attr_from_current_element($, cs, content);
        expect(result).to.equal('hello');
    });

    // it('should get multiple elements by complex selector', function() {
    //     let ap = new ActionParse(),
    //         cs = ap.build_selector('a[href]'),
    //         $ = cheerio.load('<html><body><a href="hey">hello</div></body></html>'),
    //         el = ap.get_element_by_complex_selector($, cs);

    //     expect(ap.get_element_data($, el, cs)).to.equal('hey');
    // });
});
