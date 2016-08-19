var ExtendedActionResults = {
  Page: {
    repr: function(obj) {
      return '<Page>';
    },
    gc: function(el) {
      el.close();
    }
  }
};

module.exports = ExtendedActionResults;
