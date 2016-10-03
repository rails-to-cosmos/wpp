'use strict';

function Uniquifier() {

}

Uniquifier.prototype.uniquify = function(non_uniquified_data) {
    let elems = {},
        duplicates = {},
        unique = [];

    for (let ritem of non_uniquified_data.data) {
        let id = Object.keys(ritem)[0];
        if (elems[ritem[id]]) {
            elems[ritem[id]]++;
            duplicates[ritem[id]]=elems[ritem[id]]-1;
        } else {
            elems[ritem[id]] = 1;
            unique.push(ritem);
        }
    }

    return {
        duplicates: duplicates,
        unique: unique
    };
};

module.exports = Uniquifier;
