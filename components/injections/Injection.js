var Injection = function() {

};

Injection.prototype.code = function() {

};

Injection.prototype.apply = function(page) {
    var INJECTION = this;
    return new Promise(function(resolve, reject) {
        page.evaluate(INJECTION.code)
            .then(resolve)
            .catch(reject);
    });
};

module.exports = Injection;
