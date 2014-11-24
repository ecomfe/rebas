/**
 * @file App
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');

/**
 * 默认的action的前置处理器
 *
 * @type {Array}
 */
var BEFORE_ACTION = [];

/**
 * 默认的action的后置处理器
 *
 * @type {Array}
 */
var AFTER_ACTION = [
    require('./middleware/render/ejson'),
    require('./middleware/render/json'),
    require('./middleware/render/html')('index.html')
];

var express = require('express');

/**
 * 初始化中间件
 *
 * @inner
 * @param {App} app
 */
function initMiddleware(app) {
    app.core.use(require('./middleware/response')(app));
}

/**
 * 初始化模版引擎
 *
 * @inner
 * @param {App} app
 */
function initTemplateEngine(app) {
    var core = app.core;
    var config = app.config;
    var pwd = process.cwd();
    var tplDir = path.resolve(pwd, config.template);
    var tplCommonDir = path.resolve(pwd, config.templateCommon);
    var etpl = require('./etpl');

    etpl.load(tplCommonDir);
    core.set('views', tplDir);
    core.engine('tpl', etpl);
}

/**
 * 添加action处理
 *
 * @inner
 * @param {App} app
 * @param {string} path
 * @param {Object} action
 */
function attachMethods(app, path, action) {
    var core = app.core;
    Object.keys(action).forEach(function (method) {
        var handlers = action[method];
        if (!Array.isArray(handlers)) {
            handlers = [handlers];
        }

        handlers = [].concat(app.beforeAction).concat(handlers);
        handlers = handlers.concat(app.afterAction);

        handlers.forEach(function (handler) {
            core[method](path, handler);
        });
    });
}

/**
 * 初始化路由配置
 *
 * @inner
 * @param {App} app
 */
function initRoute(app) {
    var fs = require('fs');
    var readConfig = require('./util/readConfig');
    var dir = app.config.route;
    var files = fs.readdirSync(dir);
    var routes = [];

    files.forEach(function (file) {
        file = path.resolve(dir, file);
        var st = fs.statSync(file);
        if (st.isFile()) {
            routes = routes.concat(readConfig(file));
        }
    });

    var libDir = app.config.action;
    routes.forEach(function (item) {
        var action = require(path.resolve(process.cwd(), libDir, item.action));
        attachMethods(app, item.path, action);
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
    this.config = options;
    this.core = express();
    this.beforeAction = [].concat(BEFORE_ACTION);
    this.afterAction = [].concat(AFTER_ACTION);

    // 初始化模版引擎
    initTemplateEngine(this);
    // 初始化中间件
    initMiddleware(this);
    // 初始化路由配置
    initRoute(this);
}

/**
 * 添加处理器
 *
 * @public
 * @param {string} path
 * @param {Function} fn
 */
App.prototype.use = function (path, fn) {
    this.core.use(path, fn);
};

/**
 * 添加action的前置处理器
 *
 * @public
 * @param {Function} fn
 */
App.prototype.before = function (fn) {
    this.beforeAction.push(fn);
};

/**
 * 添加action的后置处理器
 *
 * @public
 * @param {Function} fn
 */
App.prototype.after = function (fn) {
    this.afterAction.unshift(fn);
};

/**
 * 启动Server
 *
 * @public
 */
App.prototype.start = function () {
    this.core.listen(this.config.port);
};

module.exports = App;
