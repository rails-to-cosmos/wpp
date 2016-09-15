'use strict';

const assert = require('assert'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./SyntaxValidator'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor(phantom_instance, proxy, logger) {
  this.phantom_instance = phantom_instance;
  this.proxy = proxy;
  this.logger = logger;
}

WebpageProcessor.prototype.free = function(done) {
  // if (this.phantom_instance) {
  //   try {
  //     this.phantom_instance.exit();
  //   } catch (exc) {
  //     console.log(exc);
  //   }
  // }
};

WebpageProcessor.prototype.run = function(actions, done) {
  let WPP = this,
      validator = new SyntaxValidator();

  try {
    assert(WPP.phantom_instance);
  } catch (exc) {
    done(exc);
  }

  WPP.logger.info('Validate config');
  return validator.validate(actions).then(function(validator_report) { // SUCCESSFUL validation
    try {
      WPP.logger.info('Create action tree');

      let storage = new ActionResultStore(),
          factory = new ActionFactory(WPP.phantom_instance, storage),
          action_tree = new ActionTree(actions, factory);

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

          WPP.output_report(result, unique, duplicates);
          done(null, unique);
        } catch (exc) {
          done(exc);
        } finally {
          WPP.free();
        }
      }, function(exc) { // FAILED processing
        WPP.free();
        done(exc);
      });
    } catch (exc) {
      WPP.free();
      done(exc);
    }
  }, function(validator_report) { // syntax validation FAILURE
    WPP.free();
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
