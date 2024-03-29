'use strict';

const assert = require('assert'),
      is_array = require('./utils/TypeHints').is_array,

      SyntaxValidator = require('./utils/SyntaxValidator'),
      Uniquifier = require('./utils/Uniquifier'),
      ActionFactory = require('./ActionFactory'),
      ActionResultStore = require('./stores/ActionResultStore'),
      ActionTree = require('./data_structures/ActionTree');

function WebpageProcessor(phantom_instance, logger) {
    this.phantom_instance = phantom_instance;
    this.logger = logger;
    this.defaults = {
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/537.86.7'
    };
}

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
                factory = new ActionFactory(WPP.phantom_instance, storage, WPP.defaults),
                action_tree = new ActionTree(actions, factory, WPP.logger);

            WPP.logger.info('Process action tree');
            WPP.process_action_tree(action_tree).then(function(result) {
                try {
                    WPP.logger.info('Process action tree result');
                    let uniquifier = new Uniquifier();
                    let report = uniquifier.uniquify(result);
                    done(null, report.unique);
                } catch (exc) {
                    done(exc);
                }
            }, function(exc) {
                done(exc);
            });
        } catch (exc) {
            done(exc);
        }
    }, function(validator_report) {
        done(validator_report);
    });
};

WebpageProcessor.prototype.process_action_tree = function(action_tree) {
    let action_stack = action_tree.as_stack(),
        head = action_stack[0],
        tail = action_stack.splice(1, action_stack.length);

    head.logger = this.logger;
    return head.main(tail);
};

module.exports = WebpageProcessor;
