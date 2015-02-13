/**
 * @file App
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');
var log4Rebas = require('rebas-logger');
var traverse = require('./util/traverse');
var log = require('./log').get(__filename);

/**
 * 默认的action的前置处理器
 *
 * @type {Array}
 */
var BEFORE = [];

/**
 * 默认的action的后置处理器
 *
 * @type {Array}
 */
var AFTER = [
    require('./middleware/error'),
    require('./middleware/detectType'),
    require('./middleware/render/ejson'),
    require('./middleware/render/json'),
    require('./middleware/render/html')('index.html')
];

/**
 * 默认支持的HTTP Methods
 *
 * @type {Array.<string>}
 */
var METHODS = ['get', 'post', 'put', 'head', 'delete', 'options'];

var express = require('express');

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
    var readConfig = require('./util/readConfig');
    var tplDir = path.resolve(pwd, config.template);
    var tplCommonDir = path.resolve(pwd, config.templateCommon);
    var etpl = require('./etpl');

    var configFiles = traverse(tplDir, /\.json$/);
    var tplConfigPath = configFiles[0];
    var tplConfig = readConfig(tplConfigPath);
    if (tplConfig) {
        var filters = tplConfig.filters || {};
        Object.keys(filters).forEach(function (key) {
            var moduelId = path.resolve(path.dirname(tplConfigPath), filters[key]);
            filters[key] = require(moduelId);
        });
        etpl.config(tplConfig);
    }

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

    METHODS.forEach(function (method) {
        var handlers = action[method];
        if (!handlers) {
            return;
        }

        if (!Array.isArray(handlers)) {
            handlers = [handlers];
        }

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
    var dirs = app.config.route;
    var routes = [];

    var files = [];
    if (!Array.isArray(dirs)) {
        dirs = [dirs];
    }
    dirs.forEach(function (item) {
        var state = fs.statSync(item);
        if (state.isFile()) {
            files.push(item);
        }
        else if (state.isDirectory()) {
            traverse(item, /\.json$/, files);
        }
    });
    files.forEach(function (file) {
        routes = routes.concat(readConfig(file));
    });

    var libDir = app.config.action;

    if (!routes.length) {
        log.warn('No route information');
    }

    routes.forEach(function (item) {
        var action = require(path.resolve(process.cwd(), libDir, item.action));
        attachMethods(app, item.path, action);
    });
}

/**
 * App
 *
 * @constructor
 *
 * @param {Object} server
 */
function App(server) {
    this.server = server;
    this.config = server.config;
    this.core = express();
    this.befores = [].concat(BEFORE);
    this.afters = [].concat(AFTER);

    // 初始化模版引擎
    initTemplateEngine(this);
}

/**
 * 添加action的前置处理器
 *
 * @public
 * @param {string=} path
 * @param {Function} fn
 */
App.prototype.before = function () {
    this.befores.push(Array.prototype.slice.call(arguments));
};

/**
 * 添加action的后置处理器
 *
 * @public
 * @param {string=} path
 * @param {Function} fn
 */
App.prototype.after = function () {
    this.afters.unshift(Array.prototype.slice.call(arguments));
};

/**
 * 启动App
 *
 * @public
 */
App.prototype.start = function () {
    var core = this.core;

    core.use(log4Rebas.expressLogger());

    function attachMiddleware(item) {
        if (!Array.isArray(item)) {
            item = [item];
        }
        core.use.apply(core, item);
    }

    this.befores.unshift(require('./middleware/init')(this));
    this.befores.forEach(attachMiddleware);
    initRoute(this);
    this.afters.forEach(attachMiddleware);

    core.listen(this.config.port);
};

module.exports = App;
