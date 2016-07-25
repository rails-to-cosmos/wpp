var ActionDownload = require('./actions/ActionDownload'),
    ActionClick = require('./actions/ActionClick'),
    ActionParse = require('./actions/ActionParse');

function ActionFactory() {

};

ActionFactory.prototype.create_action = function(action_config, result_store, browser_instance) {
  switch (action_config.type) {
  case 'ADownload':
    return new ActionDownload(action_config, result_store, browser_instance);
  case 'AParseBySelector':
    return new ActionParse(action_config, result_store, browser_instance);
  case 'AClick':
    return new ActionClick(action_config, result_store, browser_instance);
  default:
    console.log('Unknown action received: ' + action_config.type);
    return null;
  }
};

module.exports = ActionFactory;
