/**
 * @file helper
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 设置模版
 *
 * @public
 * @param {string} file 模版路径
 * @return {Function} 中间件
 */
exports.setTemplate = function (file) {
    return function (req, res, next) {
        res.template = file;
        next();
    };
};

/**
 * debug消息输出
 *
 * @public
 * @param {*.} args 参数，等同于console.log的参数
 * @return {Function} 中间件
 */
exports.debug = function () {
    var args = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
        console.log.apply(console, args);
        next();
    };
};
