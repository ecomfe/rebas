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
    var pwd = process.cwd();

    // 初始化模版引擎
    var tplDir = path.resolve(pwd, options.template || DIR_TEMPLATE);
    var tplCommonDir = path.resolve(tplDir, options.templateCommon || DIR_TEMPLATE_COMMON);
    var etpl = require('./etpl');
    etpl.load(tplCommonDir);
    server.set('views', tplDir);
    server.engine('tpl', etpl);

    // 加载默认的中间件
    var htmlWrap = require('./middleware/html');
    server.use(htmlWrap(path.resolve(pwd, 'index.html')));
}

function App(options) {
    options = options || {};
    this.port = options.port || DEFAULT_PORT;
    this.server = express();

    initServer(this.server, options);
}

App.prototype.use = function (path, fn) {
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
