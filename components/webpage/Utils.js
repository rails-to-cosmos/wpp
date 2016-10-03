var is_object = require('../utils/TypeHints').is_object,
    is_string = require('../utils/TypeHints').is_string;

function get_page_content(page, ACTION) {
    return new Promise(function(resolve, reject) {
        if (is_object(page)) {
            page.property('content').then(function(content) {
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
