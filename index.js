/**
 * @file server
 * @author treelite(c.xinle@gmail.com)
 */

var express = require('express');
var mm = require('saber-mm');
var router = require('./lib/router');
var Element = require('./lib/Element');

// 启动tpl扩展
require('./lib/tpl');

/**
 * 运行Presenter
 *
 * @inner
 * @param {Object} route 路由信息
 * @param {Object} route.action Presenter配置
 * @param {string} path 请求路径
 * @param {Object} query 请求参数
 * @param {Object} res 请求响应对象
 * @param {Function} next 执行下一个路由处理器
 */
function run(route, path, query, res, next) {
    var presenter = mm.create(route.action);
    var ele = new Element('div');

    presenter
        .enter(ele, path, query)
        .then(
            function () {
                var model = presenter.model;
                res.html = ele.outerHTML;
                res.data = model.store;
                next();
            },
            next
        );
}


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
    routes.forEach(function (route) {
        router.add(route.path, run.bind(null, route));
    });
};

/**
 * 启动Server
 *
 * @public
 * @param {number} port 端口
 * @param {Object} options 配置信息
 */
exports.start = function (port, options) {
    options = options || {};

    mm.config({
        template: options.template || ''
    });

    var app = express();

    router.use(app);
    app.use(require('./lib/middleware/renderHTML'));

    app.listen(port);
};
