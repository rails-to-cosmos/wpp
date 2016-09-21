'use strict';

let chai = require('chai'),
    expect = chai.expect,
    DataCleaner = require('../components/webpage/DataCleaner');

describe('DataCleaner', function() {
  it('Replace multiple spaces with one', function() {
    let dc = new DataCleaner();
    expect(dc.clean('hello   hello')).to.equal('hello hello');
  });

  it('Replace newlines with one space', function() {
    let dc = new DataCleaner();
    expect(dc.clean('hello\n\n\nhello')).to.equal('hello hello');
  });

  it('Replace line breaks with one space', function() {
    let dc = new DataCleaner();
    expect(dc.clean('hello\r\n\r\nhello')).to.equal('hello hello');
  });

  it('Replace many escape symbols with one', function() {
    let dc = new DataCleaner();
    expect(dc.clean('\\\\\\\\\\\\')).to.equal('\\');
  });

  it('Replace many eq symbols with one', function() {
    let dc = new DataCleaner();
    expect(dc.clean('===')).to.equal('=');
  });

  it('Do not replace unicode characters', function() {
    let dc = new DataCleaner();
    expect(dc.clean('привет   привет')).to.equal('привет привет');
  });

  it('Trim dirty string', function() {
    let dc = new DataCleaner();
    expect(dc.clean(' привет ')).to.equal('привет');
  });
});
