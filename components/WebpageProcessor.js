'use strict';

const phantom = require('phantom'),
      assert = require('assert'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./SyntaxValidator'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

var phantom_settings = [
  '--disk-cache=false',
  '--disk-cache-path=/tmp/phantom-cache',
  '--load-images=false',
  '--cookies-file=/dev/null',
  '--ignore-ssl-errors=true',
  //  '--debug=true'
];

function WebpageProcessor() {
  this.phantom_instance = null;
}

WebpageProcessor.prototype.run = function(actions, done) {
  let WPP = this,
      validator = new SyntaxValidator();

  return validator.validate(actions).then(function(validator_report) { // SUCCESSFUL validation
    try {
      phantom_settings[1] = '--disk-cache-path=' + actions[0].data.url;

      phantom.create(phantom_settings).then(function(phantom_instance) { // phantom instance successfully created
        try {
          let storage = new ActionResultStore(),
              factory = new ActionFactory(phantom_instance, storage),
              action_tree = new ActionTree(actions, factory);

          WPP.phantom_instance = phantom_instance;

          WPP.process_action_tree(action_tree).then(function(result) { // SUCCESSFUL processing
            try {
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

              done(null, unique);

              WPP.output_report(result, unique, duplicates);
            } catch (exc) {
              done(exc);
            }

            try {
              WPP.phantom_instance.exit();
            } catch (exc) {
              console.log('Cannot kill phantom instance:', exc);
            }
          }, function(exc) { // FAILED processing
            done(exc);
          });
        } catch (exc) {
          done(exc);
        }
      }, function() { // unable to create phantom instance
        console.log('Unable to create phantom instance');
      });
    } catch (exc) {
      done(exc);
    }
  }, function(validator_report) { // syntax validation FAILURE
    done(validator_report);
  });
};

WebpageProcessor.prototype.output_report = function(result, unique, duplicates, history) {
  console.log('--- OUTPUT RECORD ---');
  console.log('Result Length:', result.data.length);
  console.log('Duplicates:', duplicates);
  console.log('Result history:', result.history.keys());
};

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  let action_stack = action_tree.as_stack(),
      head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  return head.main(tail);
};

module.exports = WebpageProcessor;
