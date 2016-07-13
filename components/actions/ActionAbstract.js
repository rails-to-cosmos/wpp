exports.config;
exports.result_store;
exports.browser_instance;

exports.constructor = (_config, _result_store, _browser_instance) => {
  exports.config = _config;
  exports.result_store = _result_store;
  exports.browser_instance = _browser_instance;
};
