var is_array = require('./TypeHints').is_array;

function SyntaxValidator() {

}

SyntaxValidator.prototype.validate = function(actions) {
    return new Promise(function(resolve, reject) {
        if (!is_array(actions)) {
            reject(new Error('Actions must be an array'));
            return;
        }

        var names = new Set();
        for (var action of actions) {
            if (names.has(action.name)) {
                reject(new Error('Action name must be unique in ' + action.name + ' action.'));
                return;
            }
            names.add(action.name);
        }

        // TODO check types (click must choose one of these targets: httpresponse, download, click)
        resolve();
    });
};

module.exports = SyntaxValidator;
