'use strict';

let chai = require('chai'),
    expect = chai.expect,
    Uniquifier = require('../components/utils/Uniquifier');

describe('Uniquifier', function() {
    it('should remove duplicates', function() {
        let uniquifier = new Uniquifier();
        let non_uniquified_data = { data:
                                    [ { a: 'https://www.facebook.com/SovSekretno.ru' },
                                      { a: 'https://twitter.com/SovSekretno' },
                                      { a: 'https://www.facebook.com/SovSekretno.ru' },
                                      { a: 'http://ok.ru/group/53052455649345' },
                                      { a: 'http://ok.ru/group/53052455649345' },
                                      { a: 'http://ok.ru/group/53052455649345' },
                                      { a: 'http://vk.com/sov.sekretno' } ]
                                  };

        let rd_report = uniquifier.uniquify(non_uniquified_data);
        expect(Object.keys(rd_report.duplicates).length).to.equal(2);
        expect(Object.keys(rd_report.duplicates)[0]).to.equal('https://www.facebook.com/SovSekretno.ru');
        expect(rd_report.duplicates['https://www.facebook.com/SovSekretno.ru']).to.equal(1);
        expect(rd_report.duplicates['http://ok.ru/group/53052455649345']).to.equal(2);

        let uniquified_data = rd_report.unique;
        for (let unique_item_index in uniquified_data.unique) {
            expect(uniquified_data[unique_item_index].a).to.equal(non_uniquified_data.data[unique_item_index].a);
        }
    });

    it('should not remove items when no duplicates', function() {
        let uniquifier = new Uniquifier();
        let non_uniquified_data = { data:
                                    [ { a: 'https://www.facebook.com/SovSekretno.ru' },
                                      { a: 'https://twitter.com/SovSekretno' },
                                      { a: 'http://ok.ru/group/53052455649345' },
                                      { a: 'http://vk.com/sov.sekretno' } ]
                                  };

        let rd_report = uniquifier.uniquify(non_uniquified_data);
        expect(Object.keys(rd_report.duplicates).length).to.equal(0);

        let uniquified_data = rd_report.unique;
        for (let unique_item_index in uniquified_data.unique) {
            expect(uniquified_data[unique_item_index].a).to.equal(non_uniquified_data.data[unique_item_index].a);
        }
    });
});
