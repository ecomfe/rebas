/**
 * @file 日志模块
 * @author treelite(c.xinle@gmail.com)
 */

var log4js = require('log4js');

/**
 * 默认日志配置项
 *
 * @type {Object}
 */
var config = {
    appenders: [
        {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '[%d] [%[%p%]] - %m'
            }
        },
        {
            type: 'dateFile',
            filename: 'log/rebas.log',
            patter: '-MM-dd-hh',
            alwaysIncludePattern: false,
            category: 'rebas',
            layout: {
                type: 'pattern',
                pattern: '[%d] [%p] - %m'
            }
        }
    ],
    levels: {
        '[all]': 'INFO',
        'rebas': 'INFO'
    }
};

var appAppender = config.appenders[1];

/**
 * 全局参数配置
 *
 * @inner
 * @param {Object} options 配置参数
 * @param {string=} options.type 日志文件类型
 * @param {string=} options.filename 日志文件名
 * @param {string=} options.pattern 日志文件命名方式
 * @param {Object=} options.layout 日志输出格式
 */
function configure(options) {
    var extend = require('saber-lang').extend;
    options = extend({}, options);

    if (options.level) {
        config.levels.rebas = options.level;
        delete options.level;
    }

    appAppender = extend(appAppender, options);
    appAppender.category = 'rebas';
    config.appenders[1] = appAppender;
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
    return log4js.connectLogger(log4js.getLogger('rebas'), {level: 'auto'});
};

// 导出日志输出方法
var methods = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
methods.forEach(function (method) {
    exports[method] = function () {
        var args = Array.prototype.slice.call(arguments);
        var logger = log4js.getLogger('rebas');

        return logger[method].apply(logger, args);
    };
});
