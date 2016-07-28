var Action = require('./Action'),
    cheerio = require('cheerio'),
    get_page_content = require('../webpage/Utils').get_page_content,
    get_representation = require('../webpage/ElementRepresentations').get_representation;

function ComplexSelector(selector) {
  this.selector = selector;
  this.attribute = '';

  var sel_attr_list = selector.match(/(.*?)\[([a-zA-Z\-]+)\]/);
  if (sel_attr_list) {
    this.selector = sel_attr_list[1];
    this.attribute = sel_attr_list[2];
  }
}

function ActionParse() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionParse.prototype = new Action();

ActionParse.prototype.get_selector = function() {
  return this.config.data.selector;
};

ActionParse.prototype.main = function(subactions) {
  var ACTION = this;

  return new Promise(function(resolve, reject) {
    ACTION.run_subactions(subactions).then(function(result) {
      resolve(result);
    });
    // var selector = new ComplexSelector(ACTION.get_selector());
    // var representation = get_representation(selector);
    // var pages = ACTION.get_from_store(ACTION.get_target());

    // var parse_actions = pages.map((page) => {
    //   return new Promise((resolveParse) => {
    //     get_page_content(page).then((content) => {
    //       var result = [];
    //       var $ = cheerio.load(content);

    //       $(selector.selector).each((id, el) => {
    //         var er = new representation($, el, selector);
    //         result.push(er.repr());
    //       });

    //       ACTION.push_to_store(result);
    //       resolveParse();
    //     });
    //   });
    // });

    // Promise.all(parse_actions).then(() => {
    //   resolve();
    // });
  });
};

module.exports = ActionParse;
