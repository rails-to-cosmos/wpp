'use strict';

let chai = require('chai'),
    cheerio = require('cheerio'),
    expect = chai.expect,
    ActionParse = require('../components/actions/ActionParse'),
    ComplexSelector = require('../components/webpage/ComplexSelector');

describe('ActionParse', function() {
    it('should clean data', function() {
        let ap = new ActionParse();
        expect(ap.clean_element_data('  hello  ')).to.equal('hello');
    });

});
