"use strict";

var os = require('os'),
    cluster = require('cluster');

const DEBUG = true;

console.log('Hello there.');

if (cluster.isMaster && !DEBUG) {
  var cpuCount = os.cpus().length;

  for (let i = 0; i < cpuCount; i++) {
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
  phantom.create(['--cookies-file=/dev/null', '--load-images=false', '--ignore-ssl-errors=yes']).then(function(browser) {
    var server = app.listen(port);
    app.post('/', function(req, res) {
      console.log('');
      console.log('Request received:', JSON.stringify(req.body));

      var config = req.body;
      let validator = new SyntaxValidator(),
          validator_result = validator.validate(config);
      if (validator_result.err_code > 0) {
        res.status(500).send('Config syntax validation failed: ' +
                             validator_result.description + '\n');
        return;
      }

      phantom_instance = browser;
      let hd = new memwatch.HeapDiff();
      let wpp = new WebpageProcessor(hd),
          storage = new ActionResultStore(),
          factory = new ActionFactory(browser, storage),
          action_tree = new ActionTree(config.actions, factory);

      wpp.process_action_tree(action_tree).then(function(result) {
        let elems = {},
            duplicates = {},
            unique = [],
            result_data = result.data,
            result_history = result.history;

        for (let ritem of result_data) {
          if (elems[ritem.id]) {
            elems[ritem.id]++;
            duplicates[ritem.id]=elems[ritem.id];
          } else {
            elems[ritem.id] = 1;
            unique.push(ritem);
          }
        }

        console.log('-----');
        console.log('Result Length:', result_data.length);
        console.log('Duplicates:', duplicates);
        console.log('Bye.');

        res.json(unique);

        storage.free();

        wpp = null;
        storage = null;
        action_tree = null;
        factory = null;
        console.log('---');
        let diff = hd.end();
        console.log('Change:', diff.change.size);
        console.log('Very bad big guys:');
        let objects = diff.change.details;
        for (let obj of objects) {
          if (obj.size_bytes // > 5000000
             && obj.what == 'String') {
            console.log(obj);
          }
        }
        console.log('---');

        console.log('Result history:', result_history.keys());
      }).catch(error => {
        ErrorHandler(error, req, res);
        phantom_instance.exit();
        server.close();
      });
    });
  });
};
