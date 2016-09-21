'use strict';

let ActionDownload = require('./actions/ActionDownload'),
    ActionHTTPRequest = require('./actions/ActionHTTPRequest'),
    ActionClickMaster = require('./actions/ActionClickMaster'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionClickSlave = require('./actions/ActionClickSlave'),
    ActionClose = require('./actions/ActionClose'),
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
  Close: ActionClose,

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

ActionFactory.prototype.inherit = function(child, parent) {
  let params_to_inherit = ['history', 'logger'];

  for (let param of params_to_inherit) {
    try {
      child[param] = parent[param];
    } catch (exc) {
      break;
    }
  }
};

ActionFactory.prototype.create_action = function(config, parent) {
  if (!(config.type in ActionAssoc)) {
    throw new Error('Unknown action received: ' + config.name + ' (' + config.type + ').');
  }

  let action = new ActionAssoc[config.type](this, config, this.storage, this.browser);
  this.inherit(action, parent);
  return action;
};

module.exports = ActionFactory;
