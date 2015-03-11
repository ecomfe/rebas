/**
 * @file Test spec for tpl
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var tplExtension = require('../lib/tpl');

describe('template extension', function () {

    var tplFile = './mock/test.tpl';

    beforeEach(function () {
        tplExtension.enable();
    });

    afterEach(function () {
        delete require.extensions['.tpl'];
        var moduleId = path.resolve(__dirname, tplFile);
        // 清除缓存
        delete require.cache[moduleId];
    });

    it('support load tpl file', function () {
        var tpl = require(tplFile);
        var data = fs.readFileSync(path.resolve(__dirname, tplFile), 'utf8');

        expect(tpl).toEqual(data);
    });

    it('should disable by call `disable()`', function () {
        var error;

        tplExtension.disable();

        try {
            require(tplFile);
        }
        catch (e) {
            error = true;
        }

        expect(error).toBeTruthy();
    });

});
