'use strict';

function DataCleaner() {

}

DataCleaner.prototype.clean = function(dirty_data) {
    let clean_data = dirty_data;
    clean_data = clean_data.replace(/\s+/g, ' ');
    clean_data = clean_data.replace(/-+/g, '-');
    clean_data = clean_data.replace(/\\+/g, '\\');
    clean_data = clean_data.replace(/=+/g, '=');
    clean_data = clean_data.trim();
    return clean_data;
};

module.exports = DataCleaner;
