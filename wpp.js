"use strict";

var os = require('os'),
    cpu_count = os.cpus().length,

    kue = require('kue'),
    jobs = kue.createQueue(),

    express = require('express'),
    app = express(),
    port = 8283,
    server = app.listen(port),

    BodyParser = require('body-parser'),
    phantom = require('phantom'),
    phantom_instance = null,
    memwatch = require('memwatch-next'),

    SyntaxValidator = require('./components/SyntaxValidator'),
    WebpageProcessor = require('./components/WebpageProcessor'),
    ActionFactory = require('./components/ActionFactory'),
    ActionResultStore = require('./components/stores/ActionResultStore'),
    ActionTree = require('./components/data_structures/ActionTree');

const ErrorHandler = function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};

function output_report(result, unique, duplicates, history) {
  console.log('--- OUTPUT RECORD ---');
  console.log('Result Length:', result.data.length);
  console.log('Duplicates:', duplicates);
  console.log('Result history:', result.history.keys());
}

app.use(BodyParser.json());
app.use(ErrorHandler);

jobs.process('wpp', cpu_count, function(job, done) {
  worker(job, done);
});

app.post('/', function(req, res) {
  var job = jobs.create('wpp', {data: req.body}).removeOnComplete(true);

  job.on('complete', function(result){
    res.json(result);
  }).on('failed attempt', function(errorMessage, doneAttempts){
    console.log('Job failed attempt');
    res.json({
      error: errorMessage
    });
  }).on('failed', function(errorMessage){
    console.log('Job failed', errorMessage);
    res.json({
      error: errorMessage
    });
  }).on('progress', function(progress, data){
    console.log('\r  job #' + job.id + ':', progress + '% complete with data:', data);
  });

  job.save(function(err){
    if(err) {
      console.log(err);
      res.json({
        error: err
      });
    }
  });
});

function initialize_phantom(job) {
  console.log('--- INITIALIZE PHANTOM ---');
  const phantom_settings = [
    '--load-images=false',
    '--cookies-file=/dev/null',
    '--ignore-ssl-errors=yes'
  ];
  console.log(phantom_settings);
  return phantom.create(phantom_settings);
}

function validate_config(config) {
  return new Promise(function(resolve, reject) {
    let validator = new SyntaxValidator(),
        validator_result = validator.validate(config);

    if (validator_result.err_code > 0) {
      console.log('Config syntax validation failed: ' + validator_result.description + '\n');
      reject();
    } else {
      resolve();
    }
  });
}

function worker(job, done) {
  console.log('\n--- JOB', job.id, '---');
  let actions = job.data.data.actions;
  console.log(JSON.stringify(actions));

  validate_config(actions).then(function() {
    initialize_phantom(job).then(function(browser) {
      let phantom_instance = browser,
          wpp = new WebpageProcessor(),
          storage = new ActionResultStore(),
          factory = new ActionFactory(browser, storage),
          action_tree = new ActionTree(actions, factory);

      wpp.process_action_tree(action_tree).then(function(result) {
        let elems = {},
            duplicates = {},
            unique = [];

        for (let ritem of result.data) {
          if (elems[ritem.id]) {
            elems[ritem.id]++;
            duplicates[ritem.id]=elems[ritem.id];
          } else {
            elems[ritem.id] = 1;
            unique.push(ritem);
          }
        }

        output_report(result, unique, duplicates);

        done(null, unique);

        phantom_instance.exit();
      });
    });
  }).catch(function(error) {
    done(error);
    phantom_instance.exit();
    server.close();
  });
}
