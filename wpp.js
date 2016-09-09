"use strict";

const express = require('express'),
      assert = require('assert'),
      app = express(),
      port = 8283,
      server = app.listen(port),

      BodyParser = require('body-parser'),

      WebpageProcessor = require('./components/WebpageProcessor');

app.use(BodyParser.json());

app.get('/', function(req, res) {
  res.sendStatus(500);
});

app.post('/', function(req, res) {
  let shout_termination_success = function() {
    // console.log('--- SUCCESS on', new Date(), '---');
  };

  let shout_termination_failure = function() {
    // console.error('--- FAILURE on', new Date(), '---');
  };

  let handle_exception = function (description, exc, req, res) {
    res.sendStatus(500);
    // console.log(description + ':', exc);
    shout_termination_failure();
    return;
  };

  // console.log('\n--- JOB RECEIVED on', new Date(), '---');

  let actions;
  try {
    actions = req.body.actions;
    assert(actions);
  } catch (exc) {
    return handle_exception('Cannot get actions', exc, req, res);
  }
  // console.log('Actions:', JSON.stringify(actions));

  let proxy;
  try {
    proxy = req.body.proxy;
  } catch (exc) {

  }
  // console.log('Proxy settings:', JSON.stringify(proxy));

  let wpp;
  try {
    wpp = new WebpageProcessor();
    assert(wpp);
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
        shout_termination_success();
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
