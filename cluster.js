var os = require('os');
var cluster = require('cluster');

if (cluster.isMaster) {
  var cpuCount = os.cpus().length;

  for (var i = 0; i < cpuCount; i++) {
    console.log('Forking PhantomJS process #' + (i + 1));
    cluster.fork();
  }

  cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died. Forking...');
    cluster.fork();
  });

} else {
  var express = require("express"),
      serve = express(),

      oop = require('oop-module'),
      WebpageProcessor = oop.class("./components/WebpageProcessor"),
      w2p = new WebpageProcessor(),

      config = require('./config'),
      port = 8008;

  serve.get('/', (req, res) => {
    w2p.process(config).then((result) => {
      res.json(result);
    });
  }).listen(port);
}
