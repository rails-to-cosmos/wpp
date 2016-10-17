"use strict";

var express = require('express'),
    app = express(),
    port = 8283,
    server = app.listen(port),
    BodyParser = require('body-parser'),

    assert = require('assert'),
    v8 = require('v8'),

    Logger = require('./components/loggers/Logger'),
    LogstashLogger = require('./components/loggers/LogstashLogger'),

    WebpageProcessor = require('./components/WebpageProcessor'),

    PhantomJSBalancer = require('./components/phantom/Balancer'),
    PhantomJSSettings = require('./components/phantom/Settings'),

    phbalancer = new PhantomJSBalancer(),

    jobs_done = 0,
    jobs_total = 0;


require('epipebomb')();
process.env.UV_THREADPOOL_SIZE = 1024;

process.on('exit', function() {
    phbalancer.free();
});

process.on('SIGINT', function(code) {
    process.exit();
});

process.on('SIGTERM', function(code) {
    process.exit();
});

console.log('Welcome to Webpage Processor Utility.\n'
            + 'WPP server listening on port', port);

app.use(BodyParser.json());

app.post('/', function(req, res) {
    let logger = new Logger(),
        logger_conf;

    jobs_total++;

    try {
        logger_conf = req.body.logging;
        assert(logger_conf);

        logger = new LogstashLogger(logger_conf.host, logger_conf.port);
        logger.project_name = 'WPP';
        logger.type = logger_conf.type;
        logger.job_type = logger_conf.job_type;
        logger.job_id = logger_conf.job_id;
        logger.url = logger_conf.url;
    } catch (exc) {
        logger.info('Using default logger');
    }

    logger.info('New job received at ' + new Date());

    let heap_stats = v8.getHeapStatistics();
    Object.keys(heap_stats).map(function(key) {
        heap_stats[key] = heap_stats[key] / 1000 + ' Mb';
    });
    logger.info(heap_stats);

    let handle_exception = function (description, exc, req, res) {
        jobs_done++;
        res.json({}).status(500);
        logger.error(description + ':', exc);
        logger.info('Job ' + jobs_done + '/' + jobs_total + ' done: FAILURE');
    };

    let actions;
    try {
        actions = req.body.actions;
        assert(actions);
    } catch (exc) {
        handle_exception('Cannot get actions', exc, req, res);
        return;
    }

    if (!logger.url) {
        try {
            logger.url = actions[0].data.url;
            assert(logger.url);
        } catch (exc) {
            logger.info('Cannot get task URL');
        }
    }

    let proxy;
    try {
        proxy = req.body.proxy;
        assert(proxy);
    } catch (exc) {
        logger.info('Proxy disabled');
    }

    let phantom_settings = new PhantomJSSettings();
    try {
        if (proxy) {
            process.env[proxy.type.toUpperCase() + '_PROXY'] = proxy[proxy.type];
            phantom_settings.set('--proxy-type', proxy.type);
            phantom_settings.set('--proxy', proxy[proxy.type]);
        }
    } catch (exc) {
        handle_exception('Cannot initialize phantomjs settings', exc, req, res);
        return;
    }

    let little_horse_ready;
    try {
        little_horse_ready = phbalancer.acquire_phantom_instance(phantom_settings);
    } catch (exc) {
        handle_exception('Cannot get phantom instance', exc, req, res);
        return;
    }

    little_horse_ready.then(function(little_horse) {
        let phantom = little_horse.phantom,
            wpp;

        try {
            wpp = new WebpageProcessor(phantom, logger);
        } catch (exc) {
            little_horse.release();
            handle_exception('Cannot create webpage processor', exc, req, res);
            return;
        }

        wpp.defaults = req.body.defaults || {};

        try {
            wpp.run(actions, function(exc, data) {
                if (exc) {
                    handle_exception('Webpage processor exception', exc, req, res);
                    little_horse.release();
                    return;
                }

                try {
                    res.json(data);
                    jobs_done++;
                    logger.info('Job ' + jobs_done + '/' + jobs_total + ' done: SUCCESS');
                } catch (exc) {
                    handle_exception('Failed to build response', exc, req, res);
                } finally {
                    little_horse.release();
                }
            });
        } catch (exc) {
            handle_exception('Task failed', exc, req, res);
            little_horse.release();
        }
    }, function(exc) {
        handle_exception('Cannot get phantom instance', exc, req, res);
    });
});
