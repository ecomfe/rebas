/**
 * @file renderHTML spec
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');
var renderHTML = require('../lib/middleware/renderHTML');

describe('renderHTML', function () {

    it('Encoding data', function () {
        var options = {
            indexFile:  path.resolve(__dirname, 'mock/index.html')
        };

        var res = {
            syncData: {
                id: '<script>alert("w");</script>'
            },
            html: true,
            send: function (html) {
                var res = html.match(/<\/script>/g);
                expect(res.length).toBe(1);
            }
        };

        var handler = renderHTML(options);

        handler({}, res, function () {});
    });

});
