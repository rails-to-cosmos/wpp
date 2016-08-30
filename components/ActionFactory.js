var ActionDownload = require('./actions/ActionDownload'),
    ActionHTTPRequest = require('./actions/ActionHTTPRequest'),
    ActionClickMaster = require('./actions/ActionClickMaster'),
    ActionClickSlave = require('./actions/ActionClickSlave'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionParse = require('./actions/ActionParse'),
    ActionHistoryBack = require('./actions/ActionHistoryBack');

const ActionAssoc = {
  Download: ActionDownload,
  FastDownload: ActionHTTPRequest,
  Parse: ActionParse,
  Click: ActionClickMaster,
  Paginate: ActionPaginate,

  // Deprecated aliases:
  ADownload: ActionDownload,
  AFastDownload: ActionHTTPRequest,
  // Parse actions
  AParse: ActionParse,
  AParseBySelector: ActionParse,
  // Click controllers
  AClick: ActionClickMaster,
  APaginate: ActionPaginate,
  APages: ActionPaginate,
  // Base click action
  AClickSlave: ActionClickSlave,
  // Webpage actions
  AHistoryBack: ActionHistoryBack
};

function ActionFactory(browser, storage) {
  this.browser = browser;
  this.storage = storage;
};

ActionFactory.prototype.create_action = function(config) {
  if (!(config.type in ActionAssoc)) {
    throw new Error('Unknown action received: ' + config.name + ' (' + config.type + ').');
  }

  return new ActionAssoc[config.type](this, config, this.storage, this.browser);
};

module.exports = ActionFactory;
