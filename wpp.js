var os = require('os'),
    cluster = require('cluster');

const DEBUG = true;

console.log('Hello there.');

if (DEBUG) {
  console.log('DEBUG', DEBUG);
}

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
      memwatch = require('memwatch-next'),

      SyntaxValidator = require('./components/SyntaxValidator'),
      WebpageProcessor = require('./components/WebpageProcessor'),
      ActionFactory = require('./components/ActionFactory'),
      ActionResultStore = require('./components/stores/ActionResultStore'),
      ActionTree = require('./components/data_structures/ActionTree');

  memwatch.on('leak', function(info) {
    console.log(info);
  });

  const ErrorHandler = function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  };

  app.use(BodyParser.json());
  app.use(ErrorHandler);

  phantom.create().then(function(browser) {
    var server = app.listen(port);
    app.post('/', function(req, res) {
      console.log('');
      console.log('Request received:', JSON.stringify(req.body));

      var config = req.body;
      var validator = new SyntaxValidator();
      var validator_result = validator.validate(config);
      if (validator_result.err_code > 0) {
        res.status(500).send('Config syntax validation failed: ' +
                             validator_result.description + '\n');
        return;
      }

      console.time('Webpage Process');
      phantom_instance = browser;
      var wpp = new WebpageProcessor(),
          storage = new ActionResultStore(),
          factory = new ActionFactory(browser, storage),
          action_tree = new ActionTree(config.actions, factory);

      wpp.process_action_tree(action_tree).then(function(result) {
        var elems = {},
            duplicates = {},
            unique = [];

        for (var ritem of result) {
          if (elems[ritem.id]) {
            elems[ritem.id]++;
            duplicates[ritem.id]=elems[ritem.id];
          } else {
            elems[ritem.id] = 1;
            unique.push(ritem);
          }
        }

        console.log('Result Length:', result.length);
        console.log('Duplicates:', duplicates);
        console.timeEnd('Webpage Process');
        console.log('Bye.');

        res.json(unique);
        delete wpp;
        delete storage;
        delete factory;
        delete action_tree;
        delete elems;
        delete duplicates;
        delete unique;
      }).catch(error => {
        ErrorHandler(error, req, res);
        phantom_instance.exit();
        server.close();
      });
    });
  });
};
