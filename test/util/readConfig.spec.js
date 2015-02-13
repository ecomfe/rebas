/**
 * @file readConfig spec
 * @author treelite(c.xinle@gmail.com)
 */

describe('readConfig', function () {

    var path = require('path');
    var readConfig = require('../../lib/util/readConfig');

    it('return data handled by JSON.parse', function () {
        var obj = readConfig(path.resolve(__dirname, '../mock/config.json'));
        expect(obj.name).toEqual('rebas');
    });

});
