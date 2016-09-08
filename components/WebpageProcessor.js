'use strict';

const phantom = require('phantom'),
      assert = require('assert'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./SyntaxValidator'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor(proxy) {
  this.phantom_instance = null;
  this.proxy = proxy;
}

WebpageProcessor.prototype.run = function(actions, done) {
  let WPP = this,
      validator = new SyntaxValidator();

  return validator.validate(actions).then(function(validator_report) { // SUCCESSFUL validation
    try {
      let phantom_settings = new Map();
      phantom_settings.set('--disk-cache', 'false');
      phantom_settings.set('--load-images', 'false');
      phantom_settings.set('--cookies-file', '/dev/null');
      phantom_settings.set('--ignore-ssl-errors', 'true');
      phantom_settings.set('--disk-cache-path', actions[0].data.url);

      if (WPP.proxy) {
        phantom_settings.set('--proxy-type', WPP.proxy.type);
        phantom_settings.set('--proxy', WPP.proxy[WPP.proxy.type]);
      }
      // phantom_settings.set('--disk-cache-path', '/tmp/phantom-cache');

      let adapted_phantom_settings = [];
      phantom_settings.forEach(function(value, key) {
        adapted_phantom_settings.push(key + '=' + value);
      });

      console.log('--- PHANTOM SETTINGS ---\n', phantom_settings);

      phantom.create(adapted_phantom_settings).then(function(phantom_instance) { // phantom instance successfully created
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
