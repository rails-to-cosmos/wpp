var os = require('os');
var cluster = require('cluster');
var debug = true;

if (cluster.isMaster && !debug) {
  var cpuCount = os.cpus().length;

  for (var i = 0; i < cpuCount; i++) {
    console.log('Forking PhantomJS process #' + (i + 1));
    cluster.fork();
  }

  cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died. Forking...');
    cluster.fork();
  });

} else if (!cluster.isMaster || debug) {
  var express = require("express"),
      WebpageProcessor = require("./components/WebpageProcessor"),
      wpp = new WebpageProcessor(),
      config = require('./ajax-config'),
      port = 8000;

  express().get('/', (req, res) => {
    wpp.process(config).then((result) => {
      res.json(result);
    });
  }).listen(port);
}
