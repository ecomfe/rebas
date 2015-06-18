/**
 * @file 日志模块
 * @author treelite(c.xinle@gmail.com)
 */

var log4js = require('log4js');
var extend = require('saber-lang').extend;

var CATE_NORMAL = 'rebas';
var CATE_SYNC = 'rebasSync';

/**
 * 默认日志配置项
 *
 * @type {Object}
 */
var config = {
    appenders: [
        {
            type: 'dateFile',
            filename: 'log/rebas.log',
            patter: '-MM-dd-hh',
            alwaysIncludePattern: false,
            category: CATE_NORMAL,
            layout: {
                type: 'pattern',
                pattern: '[%d] [%x{pid}] [%p] - %m',
                tokens: {
                    pid: process.pid
                }
            }
        },
        {
            type: 'fileSync',
            category: CATE_SYNC
        }
    ],
    levels: {
        '[all]': 'INFO'
    }
};

var appAppender = config.appenders[0];

/**
 * 附加console日志
 *
 * @inner
 * @param {Object} options 日志配置参数
 */
function attachConsole(options) {
    var appender = {
        type: 'console',
        layout: extend({}, options.layout)
    };

    if (appender.layout.type === 'pattern' && options.layout.pattern) {
        // 给终端的level加个颜色～
        appender.layout.pattern = options.layout.pattern.replace(/\[%p\]/g, '[%[%p%]]');
    }

    config.appenders.push(appender);
}

/**
 * 全局参数配置
 *
 * @inner
 * @param {Object} options 配置参数
 * @param {string=} options.type 日志文件类型
 * @param {string=} options.filename 日志文件名
 * @param {string=} options.pattern 日志文件命名方式
 * @param {Object=} options.layout 日志输出格式
 * @param {boolean=} options.console 启用console日志
 */
function configure(options) {
    var extend = require('saber-lang').extend;
    options = extend({}, options);

    if (options.level) {
        config.levels['[all]'] = options.level;
        delete options.level;
    }

    var hasConsole;
    if (options.console) {
        hasConsole = true;
        delete options.console;
    }

    appAppender = extend(appAppender, options);
    appAppender.category = CATE_NORMAL;
    config.appenders[0] = appAppender;

    // 同步fileSync的filename与layout
    var appender = config.appenders[1];
    appender.filename = appAppender.filename;
    appender.layout = appAppender.layout;

    if (hasConsole) {
        attachConsole(appAppender);
    }
}

/**
 * 确保日志所在的文件夹存在
 *
 * @inner
 * @param {string} filename 日志文件
 */
function ensureDir(filename) {
    var fs = require('fs');
    var path = require('path');
    var dir = path.dirname(filename);
    if (!fs.existsSync(dir)) {
        var mkdirp = require('mkdirp').sync;
        mkdirp(dir);
    }
}

/**
 * 模块初始化
 *
 * @public
 */
exports.init = function () {
    var getConfig = require('./util/get-config');
    var data = getConfig('log');

    // 设置自定义的日志配置信息
    configure(data);
    ensureDir(appAppender.filename);

    // 应用配置
    log4js.configure(config);
};

/**
 * 导出Express日志中间件
 *
 * @public
 * @return {Object}
 */
exports.express = function () {
    return log4js.connectLogger(log4js.getLogger(CATE_NORMAL), {level: 'auto'});
};

/**
 * 创建日志方法
 *
 * @inner
 * @param {string} category logger分类
 * @param {string} method 方法名
 * @return {Function}
 */
function createMethod(category, method) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        var logger = log4js.getLogger(category);

        return logger[method].apply(logger, args);
    };
}

// 导出日志输出方法
var methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

methods.forEach(function (method) {
    exports[method] = createMethod(CATE_NORMAL, method);
    exports[method + 'Sync'] = createMethod(CATE_SYNC, method);
});
