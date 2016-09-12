'use strict';

const phantom = require('phantom'),
      assert = require('assert'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./SyntaxValidator'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor() {
  this.phantom_instance = null;
  this.proxy = null;
  this.logger = null;
}

WebpageProcessor.prototype.run = function(actions, done) {
  let WPP = this,
      validator = new SyntaxValidator();

  WPP.logger.info('Validate config');
  return validator.validate(actions).then(function(validator_report) { // SUCCESSFUL validation
    try {
      WPP.logger.info('Create phantom instance');
      let phantom_settings = new Map();
      phantom_settings.set('--disk-cache', 'false');
      phantom_settings.set('--load-images', 'false');
      phantom_settings.set('--cookies-file', '/dev/null');
      phantom_settings.set('--ignore-ssl-errors', 'true');
      phantom_settings.set('--disk-cache-path', actions[0].data.url);
      // phantom_settings.set('--disk-cache-path', '/tmp/phantom-cache');
      if (WPP.proxy) {
        phantom_settings.set('--proxy-type', WPP.proxy.type);
        phantom_settings.set('--proxy', WPP.proxy[WPP.proxy.type]);
      }

      let adapted_phantom_settings = [];
      phantom_settings.forEach(function(value, key) {
        adapted_phantom_settings.push(key + '=' + value);
      });

      phantom.create(adapted_phantom_settings).then(function(phantom_instance) { // phantom instance successfully created
        try {
          WPP.logger.info('Create action tree');

          let storage = new ActionResultStore(),
              factory = new ActionFactory(phantom_instance, storage),
              action_tree = new ActionTree(actions, factory);

          WPP.phantom_instance = phantom_instance;

          WPP.logger.info('Process action tree');
          WPP.process_action_tree(action_tree).then(function(result) { // SUCCESSFUL processing
            try {
              WPP.logger.info('Process action tree result');
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
              done(exc);
            }
          }, function(exc) { // FAILED processing
            done(exc);
          });
        } catch (exc) {
          done(exc);
        }
      }, function(exc) { // unable to create phantom instance
        done(exc);
      });
    } catch (exc) { // webpage processor exception on init
      done(exc);
    }
  }, function(validator_report) { // syntax validation FAILURE
    done(validator_report);
  });
};

WebpageProcessor.prototype.output_report = function(result, unique, duplicates, history) {
  // this.logger.info('Result Length:', result.data.length);
  // this.logger.info('Duplicates:', duplicates);
  // console.log('Result history:', result.history.keys());
};

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  let action_stack = action_tree.as_stack(),
      head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  head.logger = this.logger;
  return head.main(tail);
};

module.exports = WebpageProcessor;
