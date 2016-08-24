var is_object = require('../utils/TypeHints').is_object,
    is_string = require('../utils/TypeHints').is_string;

function get_page_content(page, ACTION) {
  return new Promise(function(resolve, reject) {
    if (is_object(page)) {
      console.time(ACTION.get_name() + ' getting page content');

      page.property('content').then(function(content) {
        console.timeEnd(ACTION.get_name() + ' getting page content');
        resolve(content);
      });
    } else if (is_string(page)) {
      resolve(page);
    } else {
      resolve('');
    }
  });
}

module.exports = {
  get_page_content: get_page_content
};
