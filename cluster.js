var os = require('os');
var cluster = require('cluster');

const DEBUG = true;

if (cluster.isMaster && !DEBUG) {
  var cpuCount = os.cpus().length;

  for (var i = 0; i < cpuCount; i++) {
    console.log('Forking PhantomJS process #' + (i + 1));
    cluster.fork();
  }

  cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died. Forking...');
    cluster.fork();
  });

} else if (!cluster.isMaster || DEBUG) {
  var express = require("express"),
      phantom = require('phantom'),
      app = express(),
      WebpageProcessor = require("./components/WebpageProcessor"),
      config = require('./configs/habraconfig.js'),
      port = 8000,
      browser = null;

  app.get('/', (req, res) => {
    phantom.create().then(function(_browser) {
      console.log('');
      console.log('Hello.');

      browser = _browser;

      var wpp = new WebpageProcessor();
      var action_tree = wpp.grow_action_tree(config, browser);
      wpp.process_action_tree(action_tree).then(function(result) {
        res.json(result);
        browser.exit();
        console.log('Bye.');
      });
    });
  }).listen(port);
}
