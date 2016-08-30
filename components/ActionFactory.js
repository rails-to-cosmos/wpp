var ActionDownload = require('./actions/ActionDownload'),
    ActionHTTPRequest = require('./actions/ActionHTTPRequest'),
    ActionClickMaster = require('./actions/ActionClickMaster'),
    ActionClickSlave = require('./actions/ActionClickSlave'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionParse = require('./actions/ActionParse'),
    ActionStore = require('./actions/ActionStore'),
    ActionHistoryBack = require('./actions/ActionHistoryBack');

const ActionAssoc = {
  Download: ActionDownload,
  FastDownload: ActionHTTPRequest,
  Parse: ActionParse,
  Click: ActionClickMaster,
  Paginate: ActionPaginate,
  Store: ActionStore,

  // Deprecated aliases:
  ADownload: ActionDownload,
  AFastDownload: ActionHTTPRequest,

  AParse: ActionParse,
  AParseBySelector: ActionParse,

  AClick: ActionClickMaster,
  APaginate: ActionPaginate,
  APages: ActionPaginate,

  AClickSlave: ActionClickSlave,

  AStoreParam: ActionStore,

  AHistoryBack: ActionHistoryBack
};

function ActionFactory(browser, storage) {
  this.browser = browser;
  this.storage = storage;
};

ActionFactory.prototype.create_action = function(config, parent) {
  if (!(config.type in ActionAssoc)) {
    throw new Error('Unknown action received: ' + config.name + ' (' + config.type + ').');
  }

  var action = new ActionAssoc[config.type](this, config, this.storage, this.browser);
  if (parent) {
    action.history = parent.history;
  }
  return action;
};

module.exports = ActionFactory;
