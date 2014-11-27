/**
 * @file 返回类型检测
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (req, res, next) {
    if (!res.type()) {
        res.type(req.xhr ? 'ejson' : 'html');
    }
    next();
};
