/**
 * @file App
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');

var DEFAULT_PORT = 8848;

var DIR_LIB = 'lib';
var DIR_TEMPLATE = 'tpl';
var DIR_TEMPLATE_COMMON = 'common';

var express = require('express');

function initServer(server, options) {
    var tplDir = path.resolve(process.cwd(), options.template || DIR_TEMPLATE);
    var tplCommonDir = path.resolve(tplDir, options.templateCommon || DIR_TEMPLATE_COMMON);
    var etpl = require('./etpl');
    etpl.load(tplCommonDir);
    server.set('views', tplDir);
    server.engine('tpl', require('./etpl'));
}

function App(options) {
    options = options || {};
    this.port = options.port || DEFAULT_PORT;
    this.server = express();

    initServer(this.server, options);
}

App.prototype.filter = function (path, fn) {
    this.server.use(path, fn);
};

App.prototype.load = function (config) {
    var server = this.server;
    config.forEach(function (item) {
        var action = require(path.resolve(process.cwd(), DIR_LIB, item.action));
        Object.keys(action).forEach(function (method) {
            server[method](item.path, action[method]);
        });
    });
};

App.prototype.start = function () {
    this.server.listen(this.port);
};

module.exports = App;
