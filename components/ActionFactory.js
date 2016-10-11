'use strict';

let ActionDownload = require('./actions/ActionDownload'),
    ActionHTTPRequest = require('./actions/ActionHTTPRequest'),
    ActionClickMaster = require('./actions/ActionClickMaster'),
    ActionPaginate = require('./actions/ActionPaginate'),
    ActionClickSlave = require('./actions/ActionClickSlave'),
    ActionParse = require('./actions/ActionParse');

const ActionAssoc = {
    download: ActionDownload,
    fastdownload: ActionHTTPRequest,
    parse: ActionParse,
    click: ActionClickMaster,
    paginate: ActionPaginate,

    // Deprecated aliases:
    adownload: ActionDownload,
    afastdownload: ActionHTTPRequest,

    aparse: ActionParse,
    aparsebyselector: ActionParse,

    aclick: ActionClickMaster,
    apaginate: ActionPaginate,
    apages: ActionPaginate,

    aclickslave: ActionClickSlave
};

function ActionFactory(browser, storage, defaults) {
    this.browser = browser;
    this.storage = storage;
    this.defaults = defaults;
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
    let ctype = config.type.toLowerCase();
    if (!(ctype in ActionAssoc)) {
        throw new Error('Unknown action received: ' + config.name + ' (' + config.type + ').');
    }

    let action = new ActionAssoc[ctype](this, config, this.storage, this.browser, this.defaults);
    this.inherit(action, parent);
    return action;
};

module.exports = ActionFactory;
