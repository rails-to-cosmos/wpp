var ActionDownload = require('./actions/ActionDownload'),
    ActionClickController = require('./actions/ActionClickController'),
    ActionClickOneElement = require('./actions/ActionClickOneElement'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionParse = require('./actions/ActionParse');

function ActionFactory() {

};

ActionFactory.prototype.create_action = function(action_config, result_store, browser_instance) {
  switch (action_config.type) {
  case 'ADownload':
    return new ActionDownload(this, action_config, result_store, browser_instance);
  case 'AParseBySelector':
    return new ActionParse(this, action_config, result_store, browser_instance);
  case 'AClickOneElement':
    return new ActionClickOneElement(this, action_config, result_store, browser_instance);
  case 'AClick':
    return new ActionClickController(this, action_config, result_store, browser_instance);
  case 'APaginate':
    return new ActionPaginate(this, action_config, result_store, browser_instance);
  default:
    console.log('Unknown action received: ' + action_config.type);
    return null;
  }
};

module.exports = ActionFactory;
