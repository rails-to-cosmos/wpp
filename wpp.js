"use strict";

const express = require('express'),
      assert = require('assert'),
      app = express(),
      port = 8283,
      server = app.listen(port),
      BodyParser = require('body-parser'),
      Logger = require('./components/loggers/Logger'),
      LogstashLogger = require('./components/loggers/LogstashLogger'),
      WebpageProcessor = require('./components/WebpageProcessor'),
      PhantomJSBalancer = require('./components/PhantomJSBalancer');

var phbalancer = new PhantomJSBalancer();

require('epipebomb')();
process.env.UV_THREADPOOL_SIZE = 1024;

app.use(BodyParser.json());

app.post('/', function(req, res) {
  let logger = new Logger();
  let logger_conf;
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
    logger.info('Use default logger');
  }

  let handle_exception = function (description, exc, req, res) {
    res.json({
      'error': description + ' (' + exc.message + ')'
    }).status(500);

    logger.error(description + ':', exc);
    logger.info('Job done: FAILURE');
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

  try {
    let phantom_settings = new Map();
    phantom_settings.set('--disk-cache', 'false');
    phantom_settings.set('--load-images', 'false');
    phantom_settings.set('--cookies-file', '/dev/null');
    phantom_settings.set('--ignore-ssl-errors', 'true');
    phantom_settings.set('--ssl-protocol', 'any');
    if (proxy) {
      phantom_settings.set('--proxy-type', proxy.type);
      phantom_settings.set('--proxy', proxy[proxy.type]);
    }
    // if (logger.url) {
    //   phantom_settings.set('--disk-cache-path', logger.url);
    // }
    // phantom_settings.set('--debug', 'true');
    // phantom_settings.set('--disk-cache-path', '/tmp/phantom-cache');

    phbalancer.get_phantom_instance(phantom_settings).then(function(phantom_instance) {
      let wpp;
      try {
        wpp = new WebpageProcessor(phantom_instance, proxy, logger);
        assert(wpp);
      } catch (exc) {
        handle_exception('Cannot create webpage processor', exc, req, res);
        return;
      }

      try {
        wpp.run(actions, function(exc, data) {
          if (exc) {
            handle_exception('Webpage processor exception', exc, req, res);
            return;
          }

          try {
            res.json(data);
            logger.info('Job done: SUCCESS');
          } catch (exc) {
            handle_exception('Failed to build response', exc, req, res);
          }
        });
      } catch (exc) {
        handle_exception('Task failed', exc, req, res);
        return;
      }
    }, function(exc) { // cannot get phantom instance
      handle_exception('Cannot get phantom instance', exc, req, res);
    });
  } catch (exc) {
    handle_exception('Cannot get phantom instance', exc, req, res);
    return;
  }
});
