var oop = require('oop-module'),
    ActionDownload = oop.class('./actions/ActionDownload'),
    ActionClick = oop.class('./actions/ActionClick'),
    ActionParse = oop.class('./actions/ActionParse');

exports.create_action = (action_config, result_store, browser_instance) => {
  switch (action_config.type) {
  case 'ADownload':
    return new ActionDownload(action_config, result_store, browser_instance);
  case 'AClick':
    return new ActionClick(action_config, result_store);
  case 'AParseBySelector':
    return new ActionParse(action_config, result_store);
  default:
    return null;
  }
};
