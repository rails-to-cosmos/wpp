'use strict';

const assert = require('assert'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./SyntaxValidator'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor(phantom_instance, logger) {
  this.phantom_instance = phantom_instance;
  this.logger = logger;
}

WebpageProcessor.prototype.free = function(done) {

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
  return validator.validate(actions).then(function(validator_report) {
    try {
      WPP.logger.info('Create action tree');

      let storage = new ActionResultStore(),
          factory = new ActionFactory(WPP.phantom_instance, storage),
          action_tree = new ActionTree(actions, factory, WPP.logger);

      WPP.logger.info('Process action tree');
      WPP.process_action_tree(action_tree).then(function(result) {
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
      }, function(exc) {
        WPP.free();
        done(exc);
      });
    } catch (exc) {
      WPP.free();
      done(exc);
    }
  }, function(validator_report) {
    done(validator_report);
  });
};

WebpageProcessor.prototype.output_report = function(result, unique, duplicates, history) {

};

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
  let action_stack = action_tree.as_stack(),
      head = action_stack[0],
      tail = action_stack.splice(1, action_stack.length);

  head.logger = this.logger;
  return head.main(tail);
};

module.exports = WebpageProcessor;
