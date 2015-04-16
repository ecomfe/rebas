/**
 * @file server
 * @author treelite(c.xinle@gmail.com)
 */

var express = require('express');
var mm = require('saber-mm');
var router = require('./lib/router');
var Element = require('./lib/Element');
var getConfig = require('./lib/util/get-config');
var config = require('./lib/config');

var beforeMiddlewares = [];
var afterMiddlewares = [];

// 从命令行参数获取配置文件夹地址
var configDir = process.argv[2];
config.configDir = configDir || config.configDir;

// 初始化日志模块
var log = require('./lib/log');
log.init();


// 只要一息尚存就要日志!
process.on('uncaughtException', function (e) {
    // 必须同步调用
    // process.exit后事件循环机制就停止了，异步还有鸟用...
    log.fatalSync(e.stack);
    // cluster下监听了这个事件后如果不手动调用`exit`，错误的子进程不会自动退出
    // 但是又不能直接调用`process.exit`，因为这样搞会让后续监控该事件的回调都不会执行了
    // 所以使用延迟调用，先让当前所有的任务执行完毕了再退出
    process.nextTick(process.exit.bind(process, 1));
});

// 启动tpl扩展
require('./lib/tpl').enable();

/**
 * 运行Presenter
 *
 * @inner
 * @param {Object} route 路由信息
 * @param {Object} route.action Presenter配置
 * @param {Object} index 路由信息序列
 * @param {string} path 请求路径
 * @param {Object} query 请求参数
 * @param {Object} res 请求响应对象
 * @param {Function} next 执行下一个路由处理器
 */
function run(route, index, path, query, res, next) {
    mm.create(route.action).then(
        function (presenter) {
            var ele = new Element('div');

            function finish() {
                var model = presenter.model;
                res.html = ele.outerHTML;
                res.data = model.store;
                res.routeIndex = index;
                next();
            }

            presenter
                .enter(ele, path, query)
                .then(finish, next);
        },
        next
    ).then(null, next);
}

/**
 * 当前的请求上下文
 *
 * @type {Object}
 */
var currentContext;

/**
 * 设置当前的上下文
 *
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 * @param {Function} next 执行下一个中间件
 */
function setContext(req, res, next) {
    currentContext = {req: req, res: res};
    next();
}

/**
 * 附加中间件
 *
 * @param {Object} app App对象
 * @param {Object} options 配置项
 */
function attachMiddleware(app, options) {
    // 日志中间件
    app.use(log.express());
    // 初始化中间件
    app.use(require('./lib/middleware/init'));
    // 设置上下文
    app.use(setContext);

    // 附加自定义中间件
    beforeMiddlewares.forEach(function (fn) {
        app.use(fn);
    });

    // 路由绑定
    router.use(app);

    // 附加自定义中间件
    afterMiddlewares.forEach(function (fn) {
        app.use(fn);
    });

    // 页面渲染中间件
    var renderHTML = require('./lib/middleware/renderHTML');
    app.use(renderHTML({
        templateData: options.templateData,
        indexFile: options.indexFile
    }));
    // 错误处理
    app.use(require('./lib/middleware/error'));
}

/**
 * 获取saber-mm需要的配置信息
 *
 * @param {Object} options 配置信息
 * @return {Object}
 */
function getConfig4mm(options) {
    var res = {};
    var names = [
        'template', 'templateConfig', 'templateData',
        'basePath', 'Presenter', 'Model', 'View'
    ];

    names.forEach(function (name) {
        if (name in options) {
            res[name] = options[name];
        }
    });

    return res;
}

/**
 * 恢复上下文
 *
 * @public
 * @param {Object} ctx 上下文
 * @return {boolean}
 */
exports.revertContext = function (ctx) {
    if (!ctx || !ctx.res || ctx.res.headersSent) {
        return false;
    }

    currentContext = ctx;
    return true;
};

/**
 * 获取上下文
 *
 * @public
 * @return {Object}
 */
exports.getContext = function () {
    return currentContext;
};

/**
 * 使用第三方模块
 *
 * @public
 * @param {Object} m 第三方模块
 */
exports.use = function (m) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(exports);

    if (m.rebas) {
        m.rebas.apply(m, args);
    }
};

/**
 * 加载路由信息
 *
 * @public
 * @param {Object|Array.<Object>} routes 路由信息
 */
exports.load = function (routes) {
    if (!Array.isArray(routes)) {
        routes = [routes];
    }
    routes.forEach(function (route, index) {
        router.add(route.path, run.bind(null, route, index));
    });
};

/**
 * 启动Server
 *
 * @public
 * @param {number} port 端口
 * @param {Object=} options 配置信息
 * @param {string=} options.template 通用模版
 * @param {Object=} options.templateConfig 模版配置信息
 * @param {Object=} options.templatedata 通用模版数据
 * @param {string=} options.indexFile 首页模版文件
 * @param {Object=} options.Presenter Presenter基类
 * @param {Object=} options.View View基类
 * @param {Object=} options.Model Model基类
 */
exports.start = function (port, options) {
    log.info('server starting ...');
    log.info('argv: %s', process.argv.join(', '));

    port = port || config.port;
    options = options || {};

    // saber-mm 配置
    mm.config(getConfig4mm(options));

    var app = express();

    // 附加中间件
    attachMiddleware(app, options);

    app.listen(port);

    log.info('server start at %s', port);
};

/**
 * 获取配置项信息
 *
 * @public
 * @param {string} name 配置项文件名
 * @return {Object|Array}
 */
exports.get = function (name) {
    return getConfig(name);
};

/**
 * 设置需要前后端同步的数据
 *
 * @public
 * @param {string} name 数据名称
 * @param {*} value 数据内容
 */
exports.setSyncData = function (name, value) {
    config.syncData[name] = value;
};

/**
 * 添加前缀中间件
 *
 * @public
 * @param {Function} middleware 中间件
 */
exports.before = function (middleware) {
    beforeMiddlewares.push(middleware);
};

/**
 * 添加后缀中间件
 *
 * @public
 * @param {Function} middleware 中间件
 */
exports.after = function (middleware) {
    afterMiddlewares.push(middleware);
};

// 运行环境设置
require('./lib/env')(exports);

// Export Logger
exports.logger = log;
