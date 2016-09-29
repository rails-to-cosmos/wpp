'use strict';

let chai = require('chai'),
    expect = chai.expect,

    cheerio = require('cheerio'),
    ComplexSelector = require('../components/webpage/ComplexSelector'),
    ElementRepresentations = require('../components/webpage/ElementRepresentations');

describe('ElementRepresentations', function() {
    describe('#TextRepresentation', function() {
        it('should be initialized in complex selector', function() {
            let cs = new ComplexSelector('body>div');
            let repr_type = cs.selectors[0].representation;
            expect(new repr_type() instanceof ElementRepresentations.TextRepresentation).to.equal(true);
        });

        it('should extract text from element', function() {
            let cs = new ComplexSelector('body>div'),
                $ = cheerio.load('<html><body><div>hello</div></body></html>'),
                repr_type = cs.selectors[0].representation,
                element = $(cs.selectors[0].selector).get(cs.selectors[0].index),
                repr = new repr_type($, element, cs),
                exp_vals = cs.apply_on_element($, element);

            for (let exp_val of exp_vals) {
                expect(exp_val).to.equal('hello');
            }
        });

        it('should support exclude logic', function() {
            let cs = new ComplexSelector('body>span>div:exclude(span)'),
                $ = cheerio.load('<html><body><span><div>hello<span>world</span></div></span></body></html>'),
                repr_type = cs.selectors[0].representation,
                element = $(cs.selectors[0].selector).get(cs.selectors[0].index),
                repr = new repr_type($, element, cs),
                exp_vals = cs.apply_on_element($, element);

            for (let exp_val of exp_vals) {
                expect(exp_val).to.equal('hello');
            }
        });
    });

    describe('#OuterHTMLRepresentation', function() {
        it('should be initialized in complex selector', function() {
            let cs = new ComplexSelector('body>div[outerHTML]');
            let repr_type = cs.selectors[0].representation;
            expect(new repr_type() instanceof ElementRepresentations.OuterHTMLRepresentation).to.equal(true);
        });

        it('should extract outer html from element', function() {
            let cs = new ComplexSelector('body>div[outerHTML]'),
                $ = cheerio.load('<html><body><div>hello</div></body></html>'),
                repr_type = cs.selectors[0].representation,
                element = $(cs.selectors[0].selector).get(cs.selectors[0].index),
                repr = new repr_type($, element, cs),
                exp_vals = cs.apply_on_element($, element);

            for (let exp_val of exp_vals) {
                expect(exp_val).to.equal('<div>hello</div>');
            }
        });

        it('should support exclude logic', function() {
            let cs = new ComplexSelector('body>span>div[outerHTML]:exclude(span)'),
                $ = cheerio.load('<html><body><span><div>hello<span>world</span></div></span></body></html>'),
                repr_type = cs.selectors[0].representation,
                element = $(cs.selectors[0].selector).get(cs.selectors[0].index),
                repr = new repr_type($, element, cs),
                exp_vals = cs.apply_on_element($, element);

            for (let exp_val of exp_vals) {
                expect(exp_val).to.equal('<div>hello</div>');
            }
        });
    });

    describe('#AttributeRepresentation', function() {
        it('should be initialized in complex selector', function() {
            let cs = new ComplexSelector('[hello]');
            let repr_type = cs.selectors[0].representation;
            expect(new repr_type() instanceof ElementRepresentations.AttributeRepresentation).to.equal(true);
        });

        it('should extract attribute from element', function() {
            let cs = new ComplexSelector('body>div[id]'),
                $ = cheerio.load('<html><body><div id="my_id">hello</div></body></html>'),
                repr_type = cs.selectors[0].representation,
                element = $(cs.selectors[0].selector).get(cs.selectors[0].index),
                repr = new repr_type($, element, cs),
                exp_vals = cs.apply_on_element($, element);

            for (let exp_val of exp_vals) {
                expect(exp_val).to.equal('my_id');
            }
        });
    });
});
