/**
 * @file main
 * @author treelite(c.xinle@gmail.com)
 */

var App = require('./lib/App');

var CONFIG_FILE = 'rebas-config.json';

var extend = require('./lib/util/extend');
var readConfig = require('./lib/util/readConfig');

/**
 * 使用cluster启动App
 *
 * @inner
 * @param {Object} server
 */
function startAppWithCluster(server) {
    var cluster = require('cluster');
    var num = server.config.cluster;
    num = num == 'max' ? require('os').cpus().length : num;

    if (cluster.isMaster) {
        for (var i = 0; i < num; i++) {
            cluster.fork();
        }
        // TODO
        // 线程错误处理
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
    var app = new App(server.config);
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
    var defaultConfig = readConfig(path.resolve(__dirname, CONFIG_FILE));
    this.config = extend(defaultConfig, readConfig(path.resolve(process.cwd(), CONFIG_FILE)) || {});
    this.callback = callback;
}

/**
 * 启动服务器
 *
 * @public
 */
Server.prototype.start = function () {
    if (this.config.cluster) {
        startAppWithCluster(this);
    }
    else {
        startApp(this);
    }
};

module.exports = function (callback) {
    return new Server(callback);
}
