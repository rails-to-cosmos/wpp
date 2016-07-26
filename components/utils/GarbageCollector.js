var ExtendedActionResults = require('../data_structures/ExtendedActionResults');

const GC_COLLECTED = '__collected__';

function GarbageCollector(data_storage) {
  this.data_storage = data_storage;
}

GarbageCollector.prototype.collect = function() {
  var data = this.data_storage.get_data();

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      var result_list = data[key];
      result_list.forEach(function(element) {
        if(element.hasOwnProperty(GC_COLLECTED))
          return;

        if (element.constructor.name in ExtendedActionResults) {
          ExtendedActionResults[element.constructor.name].gc(element);
          element.__collected__ = true;
        }
      });
    }
  }
};

module.exports = GarbageCollector;
