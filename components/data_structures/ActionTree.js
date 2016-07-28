function ActionTree(actions, factory, store, browser) {
  this.root = '__main__';

  var tree = {};
  var hash = {};

  tree[this.root] = [];

  for (var action_config of actions) {
    var action = factory.create_action(action_config, store, browser);
    if (action_config.target) {
      if (!tree[action_config.target]) {
        tree[action_config.target] = [];
      }
      tree[action_config.target].push(action);
    } else {
      tree[this.root].push(action);
    }

    hash[action.get_name()] = action;
  }

  this.hash = hash;
  this.data = tree;
}

ActionTree.prototype.get_action = function(key) {
  return this.hash[key];
};

ActionTree.prototype.get_children = function(key) {
  return this.data[key] || [];
};

ActionTree.prototype.has_children = function(key) {
  return key in this.data;
};


module.exports = ActionTree;
