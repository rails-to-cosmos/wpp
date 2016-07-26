var ExtendedDataStructures = {
  Page: {
    repr: '<Page object>',
    gc: function(el) {
      el.close();
    }
  }
};

module.exports = ExtendedDataStructures;
