"use strict";

const express = require('express'),
      app = express(),
      port = 8283,
      server = app.listen(port),

      BodyParser = require('body-parser'),

      WebpageProcessor = require('./components/WebpageProcessor');

const ErrorHandler = function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

app.use(BodyParser.json());
app.use(ErrorHandler);

app.post('/', function(req, res) {
  worker(req.body.actions, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

function worker(actions, done) {
  var date = new Date();
  console.log('\n--- NEW JOB RECEIVED: ' + date + ' ---');
  console.log(JSON.stringify(actions));

  let wpp = new WebpageProcessor();

  wpp.run(actions, done).catch(function(error) {
    server.close();
  });
}
