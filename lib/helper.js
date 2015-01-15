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
        res.tempate = file;
        next();
    };
};
