var Action = require('./Action'),
    Webpage = require('../webpage/Webpage');

function ActionStore() {
    Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionStore.prototype = new Action();

ActionStore.prototype.main = function (subactions) {
    var ACTION = this;

    Action.prototype.main.call(this, subactions);

    return new Promise(function(resolve, reject) {
        try {
            var data = ACTION.config.data;
            var current_index = 0;

            data.replace(/\{\{([a-zA-Z]+)\}\}/g, function(match, alias) {
                var target_action_result = ACTION.get_from_store(alias);
                current_index++;
                return target_action_result[current_index];
            });

            ACTION.push_to_store(ACTION.config.data);
            ACTION.run_subactions(subactions).then(resolve, reject);
        } catch (exc) {
            reject(exc);
        }
    });
};

module.exports = ActionStore;
