/**
 * @file Init for Rquester
 * @author treelite(c.xinle@gmail.com)
 */

var uid = require('uid-safe');

module.exports = function (req, res, next) {
    // 为每个请求生成uid
    uid(24, function (err, id) {
        if (err) {
            return next(err);
        }

        req.uid = id;

        // 需要前后端同步的数据
        res.syncData = {};

        // 本次请求附加的静态模版变量
        res.templateData = {};

        next();
    });
};
