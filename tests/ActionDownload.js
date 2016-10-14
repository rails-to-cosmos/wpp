'use strict';

let chai = require('chai'),
    cheerio = require('cheerio'),
    expect = chai.expect,
    ActionDownload = require('../components/actions/ActionDownload'),

    PhantomJSBalancer = require('../components/phantom/Balancer'),
    PhantomJSSettings = require('../components/phantom/Settings'),
    ActionFactory = require('../components/ActionFactory'),
    ActionResultStore = require('../components/stores/ActionResultStore'),

    phantom_settings = new PhantomJSSettings(),
    phbalancer = new PhantomJSBalancer(),
    phantom = phbalancer.acquire_phantom_instance(phantom_settings),
    storage = new ActionResultStore(),
    factory = new ActionFactory(phbalancer.acquire_phantom_instance, storage);

describe('ActionDownload', function() {
    it('should create web page instance', function() {
        let action = factory.create_action({
                name: 'test_download',
                type: 'download',
                target: 'http://google.com'
            });
        action.main([]).then(function(result) {
            console.log(result);
            // done();
        });
    });
    it('should download page', function() {});
    it('should start phantomjs process', function() {});
    it('should raise phantomjs does not responding on timeout', function() {});
    it('should close page on error', function() {});
});
