/**
 * @file get-config
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');
var getConfig = require('../lib/util/get-config');

describe('get-config', function () {

    it('return object', function () {
        var data = require('./mock/config');
        var res = getConfig('config', path.resolve(process.cwd(), 'test/mock'));

        expect(res).toEqual(data);
    });

    it('return undefined while file is not existing', function () {
        var res = getConfig('no');
        expect(res).toBeUndefined();
    });

    it('return undefined object while data is not JSON', function () {
        var res = getConfig('error', path.resolve(process.cwd(), 'test/mock'));

        expect(res).toBeUndefined();
    });

});
