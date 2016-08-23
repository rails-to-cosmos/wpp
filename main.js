var os = require('os');
var cluster = require('cluster');

const DEBUG = true;

console.log('Hello there.');
console.log('DEBUG', DEBUG);

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
      BodyParser = require('body-parser'),
      phantom = require('phantom'),
      phantom_instance = null,
      app = express(),
      port = 8283,

      WebpageProcessor = require('./components/WebpageProcessor'),
      ActionFactory = require('./components/ActionFactory'),
      ActionResultStore = require('./components/stores/ActionResultStore'),
      ActionTree = require('./components/data_structures/ActionTree');

  const ErrorHandler = function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  };

  app.use(BodyParser.json());
  app.use(ErrorHandler);

  app.post('/', (req, res) => {
    console.log('');
    console.log('Request received.');

    var config = req.body;
    if (!config.actions) {
      console.log('Nothing to do.');
      console.log('Bye.');
      res.json({});
      return;
    }

    phantom.create().then(function(browser) {
      console.time('Webpage Process');
      phantom_instance = browser;
      var wpp = new WebpageProcessor();
      var storage = new ActionResultStore();
      var factory = new ActionFactory(browser, storage);
      var action_tree = new ActionTree(config.actions, factory);

      wpp.process_action_tree(action_tree).then(function(result) {
        res.json(result);
        console.log('Result length:', result.length);
        browser.exit();
        console.log('Bye.');
        console.timeEnd('Webpage Process');
      });

    }).catch(error => {
      ErrorHandler(error, req, res);
      phantom_instance.exit();
    });
  }).listen(port);
}