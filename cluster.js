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
  var express = require('express'),
      phantom = require('phantom'),
      app = express(),
      port = 8000,

      WebpageProcessor = require('./components/WebpageProcessor'),
      ActionFactory = require('./components/ActionFactory'),
      ActionResultStore = require('./components/stores/ActionResultStore'),
      ActionTree = require('./components/data_structures/ActionTree'),
      config = require('./configs/paginate-config.js');

  app.get('/', (req, res) => {
    phantom.create().then(function(browser) {
      console.log('');
      console.log('Hello.');
      var wpp = new WebpageProcessor();
      var storage = new ActionResultStore();
      var factory = new ActionFactory(browser, storage);
      var action_tree = new ActionTree(config.actions,
                                       factory);

      wpp.process_action_tree(action_tree).then(function(result) {
        res.json(result);
        browser.exit();
        console.log('Bye.');
      });
    });
  }).listen(port);
}
