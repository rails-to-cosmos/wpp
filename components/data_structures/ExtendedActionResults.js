var ExtendedActionResults = {
  Page: {
    repr: '<Page object>',
    gc: function(el) {
      el.close();
    }
  }
};

module.exports = ExtendedActionResults;
