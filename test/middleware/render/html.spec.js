/**
 * @file render HTML spec
 * @author treelite(c.xinle@gmail.com)
 */

describe('render HTML', function () {

    var fs = require('fs');
    var path = require('path');
    var builder = require('../../../lib/middleware/render/html');
    var renderHTML = builder(path.resolve(__dirname, '../../mock/index.html'));

    it('only care the html file which contains template', function () {
        var res = {
            template: 'xxx',
            type: function () {
                return 'xml';
            }
        };

        renderHTML({}, res, function () {
            expect(arguments.length).toEqual(0);
        });

        res.type = function () {
            return 'html';
        };
        res.template = '';

        renderHTML({}, res, function () {
            expect(arguments.length).toEqual(0);
        });
    });

    it('with data injection', function () {
        var res = {
            template: path.resolve(__dirname, '../../mock/template.tpl'),
            data: {name: 'rebas'},
            send: jasmine.createSpy('sned'),
            render: function (tpl, data, callback) {
                callback(null, '<span>content</span>');
            },
            type: function () {
                return 'html';
            }
        };

        var content = fs.readFileSync(path.resolve(__dirname, '../../mock/rIndex.html'), 'utf8');

        renderHTML({}, res, function () {
            expect(res.send).toHaveBeenCalled();
            var args = res.send.mostRecentCall.args;
            expect(args[0].trim()).toEqual(content.trim());
        });
    });

});
