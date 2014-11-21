/**
 * @file App
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');

var DEFAULT_PORT = 8848;

var DIR_LIB = 'lib';
var DIR_TEMPLATE = 'tpl';
var DIR_TEMPLATE_COMMON = 'common';

// action的前置处理器
var actionBefore = [];
// action的后置处理器
var actionAfter = [
    require('./middleware/render/ejson'),
    require('./middleware/render/json'),
    require('./middleware/render/html')('index.html')
];

var express = require('express');

/**
 * 初始化Server
 *
 * @inner
 * @param {Object} server
 * @param {Object} options
 */
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
    server.use(require('./middleware/response'));
}

/**
 * 添加action处理
 *
 * @inner
 * @param {Object} server
 * @param {string} path
 * @param {Object} action
 */
function attachMethods(server, path, action) {
    Object.keys(action).forEach(function (method) {
        var handlers = action[method];
        if (!Array.isArray(handlers)) {
            handlers = [handlers];
        }

        handlers = [].concat(actionBefore).concat(handlers);
        handlers = handlers.concat(actionAfter);

        handlers.forEach(function (handler) {
            server[method](path, handler);
        });
    });
}

/**
 * App
 *
 * @constructor
 * @param {Object} options
 * @param {number} options.port
 */
function App(options) {
    options = options || {};
    this.port = options.port || DEFAULT_PORT;
    this.server = express();

    initServer(this.server, options);
}

/**
 * 添加处理器
 *
 * @public
 * @param {string} path
 * @param {Function} fn
 */
App.prototype.use = function (path, fn) {
    this.server.use(path, fn);
};

/**
 * 添加action的前置处理器
 *
 * @public
 * @param {Function} fn
 */
App.prototype.before = function (fn) {
    actionBefore.push(fn);
};

/**
 * 添加action的后置处理器
 *
 * @public
 * @param {Function} fn
 */
App.prototype.after = function (fn) {
    actionAfter.unshift(fn);
};

/**
 * 加载路由配置
 *
 * @public
 * @param {Object} config
 */
App.prototype.load = function (config) {
    var server = this.server;
    config.forEach(function (item) {
        var action = require(path.resolve(process.cwd(), DIR_LIB, item.action));
        attachMethods(server, item.path, action);
    });
};

/**
 * 启动Server
 *
 * @public
 */
App.prototype.start = function () {
    this.server.listen(this.port);
};

module.exports = App;
