/**
 * @file etpl spec
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');

describe('support etpl', function () {
    var etpl = require('../lib/etpl');

    describe('render', function () {

        it('file', function (done) {
            var data = {name: 'etpl'};
            var tpl = path.resolve(__dirname, 'mock/template.tpl');

            etpl(tpl, data, function (unused, res) {
                expect(res.trim()).toEqual(data.name);
                done();
            });
        });

        it('file with target', function (done) {
            var data = {content: 'etpl'};
            var tpl = path.resolve(__dirname, 'mock/template.tpl');
            tpl += '#content';

            etpl(tpl, data, function (unused, res) {
                expect(res.trim()).toEqual(data.content);
                done();
            });
        });

    });

    describe('load', function () {

        it('common template', function (done) {
            var data = {common: 'common', subname: 'subname'};
            var commonTpl = path.resolve(__dirname, 'mock/common.tpl');
            var tpl = path.resolve(__dirname, 'mock/sub.tpl');

            etpl.load(commonTpl);
            etpl(tpl, data, function (unused, res) {
                expect(res.trim()).toEqual(data.subname + '\n' + data.common);
                done();
            });
        });

    });

});
