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
      PhantomJSBalancer = require('./components/phantom/Balancer');

var phbalancer = new PhantomJSBalancer(),
    jobs_in_progress = new Map(),
    jobs_count = 0,
    jobs_start_time = new Date(),
    imem = 0;

function inc_jobs_in_progress(url) {
  url = url.substring(0 , 15);
  if (jobs_count == 0) {
    imem = process.memoryUsage();
    jobs_start_time = new Date();
    // console.log('Jobs started, please wait...');
  }
  jobs_in_progress.set(url, new Date());
  jobs_count++;
}

function dec_jobs_in_progress(url) {
  try {
    url = url.substring(0 , 15);
    let start = jobs_in_progress.get(url).getTime(),
        finish = (new Date()).getTime();
    jobs_in_progress.set(url, ((finish - start) / 1000).toFixed(2));
    jobs_count--;

    if(jobs_count == 0) {
      // console.log(jobs_in_progress);
      let mem = process.memoryUsage(),
          jobs_finish_time = new Date();
      // console.log('Estimated time:', ((jobs_finish_time.getTime() - jobs_start_time.getTime()) / 1000).toFixed(2));
      // console.log('Memory usage diff:', mem.rss - imem.rss, mem.heapTotal - imem.heapTotal, mem.heapUsed - imem.heapUsed);
    }
  } catch (exc) {
    // console.log(exc);
  }
}

require('epipebomb')();
process.env.UV_THREADPOOL_SIZE = 1024;

process.on('exit', function() {
  // console.log('Exit: Destroy related phantomjs processes.');
  phbalancer.free();
});

process.on('SIGINT', function(code) {
  process.exit();
});

process.on('SIGTERM', function(code) {
  process.exit();
});

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
    // let data = {
    //   error: description + ' (' + exc.message + ')',
    //   result: {}
    // };
    res.json({}).status(500);
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
      process.env['HTTP_PROXY'] = proxy[proxy.type];
    }

    // TODO insert request settings here

    phbalancer.acquire_phantom_instance(phantom_settings).then(function(little_horse) {
      let phantom = little_horse.phantom,
          wpp;

      try {
        wpp = new WebpageProcessor(phantom, proxy, logger);
        assert(wpp);
      } catch (exc) {
        handle_exception('Cannot create webpage processor', exc, req, res);
        return little_horse.release();
      }

      try {
        inc_jobs_in_progress(logger.url);
        wpp.run(actions, function(exc, data) {
          dec_jobs_in_progress(logger.url);
          if (exc) {
            handle_exception('Webpage processor exception', exc, req, res);
            return little_horse.release();
          }

          try {
            res.json(data);
            logger.info('Job done: SUCCESS');
          } catch (exc) {
            handle_exception('Failed to build response', exc, req, res);
          }

          return little_horse.release();
        });
      } catch (exc) {
        dec_jobs_in_progress(logger.url);
        handle_exception('Task failed', exc, req, res);
        return little_horse.release();
      }
    }, function(exc) {
      dec_jobs_in_progress(logger.url);
      handle_exception('Cannot get phantom instance', exc, req, res);
    });
  } catch (exc) {
    handle_exception('Cannot get phantom instance', exc, req, res);
  }
});
