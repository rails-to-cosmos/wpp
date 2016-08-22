var ActionDownload = require('./actions/ActionDownload'),
    ActionClickController = require('./actions/ActionClickController'),
    ActionClickOneElement = require('./actions/ActionClickOneElement'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionParse = require('./actions/ActionParse'),
    ActionHistoryBack = require('./actions/ActionHistoryBack');

const ActionAssoc = {
  Download: ActionDownload,
  Parse: ActionParse,
  Click: ActionClickController,
  Paginate: ActionPaginate,

  // Deprecated aliases:
  ADownload: ActionDownload,
  // Parse actions
  AParse: ActionParse,
  AParseBySelector: ActionParse,
  // Click controllers
  AClick: ActionClickController,
  APaginate: ActionPaginate,
  // Base click action
  AClickOneElement: ActionClickOneElement,
  // Webpage actions
  AHistoryBack: ActionHistoryBack
};

function ActionFactory(browser, storage) {
  this.browser = browser;
  this.storage = storage;
};

ActionFactory.prototype.create_action = function(config) {
  if (!config.type in ActionAssoc) {
    console.log('Unknown action received: ' + config.type);
    return null;
  }

  return new ActionAssoc[config.type](this, config, this.storage, this.browser);
};

module.exports = ActionFactory;
