'use strict';

function ActionTree(actions, factory) {
  // TODO check duplicates

  this.root = '__root__';

  let tree = {},
      hash = {};

  tree[this.root] = [];

  for (let action_config of actions) {
    let action;

    try {
      action = factory.create_action(action_config);
    } catch(e) {
      // console.log('Warning:', e.message, 'Ignoring.');
      continue;
    }

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

ActionTree.prototype.dfs = function* () {
  let visited = new Set(),
      stack = [this.root];

  while (stack.length > 0) {
    let vertex = stack.pop();
    if (vertex && !(vertex in visited)) {
      for(let action of this.get_children(vertex)) {
        stack.push(action.get_name()); // run child actions
      }

      visited.add(vertex);

      if (vertex != this.root) {
        yield this.get_action(vertex);
      }
    }
  }
};

ActionTree.prototype.as_stack = function() {
  let action_stack = [];
  for (let action of this.dfs()) {
    if (action != this.root) {
      action_stack.push(action);
    }
  }
  return action_stack;
};


module.exports = ActionTree;
