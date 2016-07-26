function ActionTree(actions, factory, store, browser) {
  this.root = '__main__';

  var tree = {};
  tree[this.root] = [];

  for (var action_index in actions) {
    var action_config = actions[action_index];
    var action = factory.create_action(action_config, store, browser);
    if (action_config.target) {
      if (!tree[action_config.target]) {
        tree[action_config.target] = [];
      }
      tree[action_config.target].push(action);
    } else {
      tree[this.root].push(action);
    }
  }

  this.data = tree;
}


module.exports = ActionTree;
