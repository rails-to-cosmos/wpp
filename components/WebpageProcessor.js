'use strict';

const phantom = require('phantom'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./SyntaxValidator'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor() {
  this.phantom_instance = null;
}

WebpageProcessor.prototype.run = function(actions, done) {
  let WPP = this;

  return WPP.validate_config(actions).then(function() {
    WPP.initialize_phantom().then(function(browser) {
      WPP.phantom_instance = browser;

      let storage = new ActionResultStore(),
          factory = new ActionFactory(browser, storage),
          action_tree = new ActionTree(actions, factory);

      WPP.process_action_tree(action_tree).then(function(result) {
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

        WPP.output_report(result, unique, duplicates);

        if (done) {
          done(null, unique);
        }

        WPP.phantom_instance.exit();
      });
    });
  }).catch(function(error) {
    WPP.phantom_instance.exit();
    if (done) {
      done(error);
    }
    throw(error);
  });
};

WebpageProcessor.prototype.output_report = function(result, unique, duplicates, history) {
  console.log('--- OUTPUT RECORD ---');
  console.log('Result Length:', result.data.length);
  console.log('Duplicates:', duplicates);
  console.log('Result history:', result.history.keys());
};

WebpageProcessor.prototype.validate_config = function(config) {
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
};

WebpageProcessor.prototype.initialize_phantom = function() {
  console.log('--- INITIALIZE PHANTOM ---');
  const phantom_settings = [
    '--load-images=false',
    '--cookies-file=/dev/null',
    '--ignore-ssl-errors=yes'
  ];
  console.log(phantom_settings);
  return phantom.create(phantom_settings);
};

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  var action_stack = action_tree.as_stack();
  return this.process_action_stack(action_stack);
};

WebpageProcessor.prototype.process_action_stack = function(action_stack) {
  var head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  return head.main(tail);
};

module.exports = WebpageProcessor;
