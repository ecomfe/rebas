/**
 * @file Router
 * @author treelite(c.xinle@gmail.com)
 * @desc 基于Express的路由进行封装，路由按照先后顺序匹配并执行一次
 */

var extend = require('saber-lang').extend;

/**
 * 路由规则
 *
 * @type {Array}
 */
var rules = [];

/**
 * 封装路由处理函数
 *
 * @inner
 * @param {Function} fn 实际的路由处理函数
 * @return {Function}
 */
function wrapHandler(fn) {
    return function (req, res, next) {
        // 防止重入
        if (req._routed) {
            return next();
        }

        req._routed = true;
        var query = extend({}, req.params, req.query);
        fn(req.path, query, res, next);
    };
}

/**
 * 添加路由规则
 *
 * @public
 * @param {string} path 路径
 * @param {Function} fn 路由处理函数
 */
exports.add = function (path, fn) {
    rules.push({
        path: path,
        fn: wrapHandler(fn)
    });
};

/**
 * 应用路由规则
 *
 * @public
 * @param {Object} app Express App
 */
exports.use = function (app) {
    rules.forEach(function (rule) {
        // 只匹配GET请求
        app.get(rule.path, rule.fn);
    });
};
