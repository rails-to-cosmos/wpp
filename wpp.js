"use strict";

const express = require('express'),
      assert = require('assert'),
      app = express(),
      port = 8283,
      server = app.listen(port),
      BodyParser = require('body-parser'),
      Logger = require('./components/loggers/Logger'),
      LogstashLogger = require('./components/loggers/LogstashLogger'),
      WebpageProcessor = require('./components/WebpageProcessor');

require('epipebomb')();
process.env.UV_THREADPOOL_SIZE = 1024;

app.use(BodyParser.json());

app.get('/', function(req, res) {
  res.sendStatus(500);
});

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
    res.sendStatus(500);
    logger.error(description + ':', exc);
    logger.info('Job done: FAILURE');
  };

  let actions;
  try {
    actions = req.body.actions;
    assert(actions);
  } catch (exc) {
    return handle_exception('Cannot get actions', exc, req, res);
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

  let wpp;
  try {
    wpp = new WebpageProcessor();
    assert(wpp);
    wpp.logger = logger;
    wpp.proxy = proxy;
  } catch (exc) {
    return handle_exception('Cannot create webpage processor', exc, req, res);
  }

  try {
    wpp.run(actions, function(exc, data) {
      if (exc) {
        return handle_exception('Webpage processor exception', exc, req, res);
      }

      try {
        res.json(data);
        logger.info('Job done: SUCCESS');
      } catch (exc) {
        return handle_exception('Failed to build response', exc, req, res);
      }

      return true;
    });
  } catch (exc) {
    return handle_exception('Task failed', exc, req, res);
  }

  return true;
});
