var ActionDownload = require('./actions/ActionDownload'),
    ActionClickController = require('./actions/ActionClickController'),
    ActionClickOneElement = require('./actions/ActionClickOneElement'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionParse = require('./actions/ActionParse'),
    ActionHistoryBack = require('./actions/ActionHistoryBack');

const ActionAssoc = {
  ADownload: ActionDownload,
  AParseBySelector: ActionParse,
  AClickOneElement: ActionClickOneElement,
  AClick: ActionClickController,
  APaginate: ActionPaginate,
  AHistoryBack: ActionHistoryBack
};

function ActionFactory() {

};

ActionFactory.prototype.create_action = function(action_config, result_store, browser_instance) {
  if (!action_config.type in ActionAssoc) {
    console.log('Unknown action received: ' + action_config.type);
    return null;
  }

  return new ActionAssoc[action_config.type](this, action_config, result_store, browser_instance);
};

module.exports = ActionFactory;
