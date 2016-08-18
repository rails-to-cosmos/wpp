var ExtendedActionResults = {
  Page: {
    repr: function(obj) {
      return obj.property('plainText');
    },
    gc: function(el) {
      el.close();
    }
  }
};

module.exports = ExtendedActionResults;
