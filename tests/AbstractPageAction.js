'use strict';

let chai = require('chai'),
    cheerio = require('cheerio'),
    expect = chai.expect,
    AbstractPageAction = require('../components/actions/AbstractPageAction');

describe('AbstractPageAction', function() {
    it('should provide report logic', function() {
        let action = new AbstractPageAction();
        expect(action.need_report()).to.equal(false);
        action.config.settings.report = '/tmp/report';
        expect(action.need_report()).to.equal(true);
        expect(action.get_report_filename('test', 'html')).to.equal('/tmp/report_test.html');
        expect(action.get_report_filename('test')).to.equal('/tmp/report_test.txt');
        expect(action.get_report_filename()).to.equal('/tmp/report.txt');

        action.config.settings.report = null;
        expect(action.need_report()).to.equal(false);
        expect(action.get_report_filename()).to.equal('report.txt');
    });
});
