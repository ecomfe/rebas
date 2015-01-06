/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

var App = require('./lib/App');

var DEFAULT_CONFIG_DIR = 'config';
var CONFIG_FILE = 'rebas.json';

var extend = require('./lib/util/extend');
var readConfig = require('./lib/util/readConfig');
var log = require('./lib/log').get(__filename);

/**
 * 从命令行获取配置文件的路径
 *
 * @inner
 * @return {string}
 */
function getConfigDir() {
    var dir;
    var args = process.argv;
    var path = require('path');

    for (var i = 0, item; item = args[i]; i++) {
        if (item === '-c' || item === '--config') {
            dir = args[i + 1];
            break;
        }
    }

    if (dir) {
        return path.resolve(process.cwd(), dir);
    }
}

/**
 * 使用cluster启动App
 *
 * @inner
 * @param {Object} server
 */
function startAppWithCluster(server) {
    var cluster = require('cluster');
    var num = server.config.cluster;
    var maxNum = require('os').cpus().length;

    if (num === 'max' || num > maxNum) {
        num = maxNum;
    }

    if (cluster.isMaster) {
        log.info('start with %s clusters', num);
        for (var i = 0; i < num; i++) {
            cluster.fork();
        }

        cluster.on('exit', function (worker, code, signal) {
            // 线程错误处理
            log.fetal('woker died (%s), restarting...', signal || code);
            cluster.fork();
        });
    }
    else {
        startApp(server);
    }
}

/**
 * 启动App
 *
 * @inner
 * @param {Object} server
 */
function startApp(server) {
    var app = new App(server);
    if (server.callback) {
        server.callback(app);
    }
    app.start();
}

/**
 * Server
 *
 * @public
 * @param {Function=} callback
 */
function Server(callback) {
    var path = require('path');

    this.configDir = getConfigDir() || path.resolve(process.cwd(), DEFAULT_CONFIG_DIR);
    var defaultConfig = readConfig(path.resolve(__dirname, CONFIG_FILE));
    var extConfig = readConfig(path.resolve(this.configDir, CONFIG_FILE)) || {};
    this.config = extend(defaultConfig, extConfig);

    this.callback = callback;

    // 初始化日志模块
    require('./lib/log').init(this.configDir);
}

/**
 * 启动服务器
 *
 * @public
 */
Server.prototype.start = function () {
    log.info('server start');
    if (this.config.cluster) {
        startAppWithCluster(this);
    }
    else {
        startApp(this);
    }
    log.info('server start finish');
};

/**
 * 获取配置信息
 * 如果省略参数则返回Server的配置信息
 *
 * @public
 * @param {string=} name 配置文件名
 * @return {*}
 */
Server.prototype.getConfig = function (name) {
    var path = require('path');
    if (!name) {
        return extend({}, this.conig);
    }
    else {
        return readConfig(path.resolve(this.configDir, name));
    }
};

module.exports = function (callback) {
    return new Server(callback);
};
