var Action = require('./Action'),
    ComplexSelector = require('../ComplexSelector'),
    cheerio = require('cheerio'),
    is_object = require('../../utils').is_object,
    is_string = require('../../utils').is_string;

function get_page_content(page) {
  return new Promise((resolve, reject) => {
    if (is_object(page)) {
      page.property('content').then((content) => {
        resolve(content);
      });
    } else if (is_string(page)) {
      resolve(page);
    } else {
      resolve('');
    }
  });
}

function ActionParse() {
  Action.apply(this, Array.prototype.slice.call(arguments));
}

ActionParse.prototype = new Action();

ActionParse.prototype.main = function() {
  var BROWSER = this.browser,
      CONFIG = this.config,
      STORE = this.store;

  return new Promise((resolve, reject) => {
    var selector = new ComplexSelector(CONFIG.data.selector);

    var pages = STORE.get(CONFIG.target);
    var parse_actions = pages.map((page) => {
      return new Promise((resolveParse) => {
        get_page_content(page).then((content) => {
          var result = [];
          var $ = cheerio.load(content);

          $(selector.selector).each((id, el) => {
            if (selector.flags.outer_html == true) {
              result.push($(el).html());
            } else {
              result.push($(el).text());
            }
          });

          STORE.push(CONFIG.name, result, true);

          resolveParse();
        });
      });
    });

    Promise.all(parse_actions).then(() => {
      resolve();
    });
  });
};

module.exports = ActionParse;
