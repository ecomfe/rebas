/**
 * @file 日志模块
 * @author treelite(c.xinle@gmail.com)
 */

var path = require('path');
var log4Rebas = require('rebas-logger');
var basePath = path.resolve(__dirname, '../');

var LOG_CONFIG = 'log.json';

/**
 * 框架日志对象
 * 全局单例
 *
 * @type {Object}
 */
var logger = {};

/**
 * 包装日志输出函数
 *
 * @innner
 * @param {string} name 方法名
 * @param {string} file 需要附加的文件路径
 */
function createFn(name, file) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        args[0] = file + ' - ' + args[0];
        return logger[name].apply(logger, args);
    };
}

var fns = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

/**
 * 日志初始化
 *
 * @public
 * @param {string} 用户自定义配置文件目录
 */
exports.init = function (configDir) {
    var fs = require('fs');
    // 加载框架日志配置
    log4Rebas.setConfig(path.resolve(__dirname, LOG_CONFIG));

    // 加载用户自定义日志模块
    var customConfig = path.resolve(configDir, LOG_CONFIG);
    if (fs.existsSync(customConfig)) {
        log4Rebas.setConfig(customConfig);
    }

    logger = log4Rebas.getLogger('Rebas');
};

/**
 * 获取日志对象
 *
 * @public
 * @param {string} file 文件路径
 * @return {Object}
 */
exports.get = function (file) {
    var res = {};
    file = path.relative(basePath, file);
    fns.forEach(function (name) {
        res[name] = createFn(name, file);
    });
    return res;
};
