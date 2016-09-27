'use strict';

let chai = require('chai'),
    expect = chai.expect,
    DataCleaner = require('../components/webpage/DataCleaner');

describe('DataCleaner', function() {
    it('should replace multiple spaces with one', function() {
        let dc = new DataCleaner();
        expect(dc.clean('hello   hello')).to.equal('hello hello');
    });

    it('should replace newlines with one space', function() {
        let dc = new DataCleaner();
        expect(dc.clean('hello\n\n\nhello')).to.equal('hello hello');
    });

    it('should replace line breaks with one space', function() {
        let dc = new DataCleaner();
        expect(dc.clean('hello\r\n\r\nhello')).to.equal('hello hello');
    });

    it('should replace many escape symbols with one', function() {
        let dc = new DataCleaner();
        expect(dc.clean('\\\\\\\\\\\\')).to.equal('\\');
    });

    it('should replace many eq symbols with one', function() {
        let dc = new DataCleaner();
        expect(dc.clean('===')).to.equal('=');
    });

    it('should not replace unicode characters', function() {
        let dc = new DataCleaner();
        expect(dc.clean('привет   привет')).to.equal('привет привет');
    });

    it('should trim dirty string', function() {
        let dc = new DataCleaner();
        expect(dc.clean(' привет ')).to.equal('привет');
    });
});
