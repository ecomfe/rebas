/**
 * @file 初始化
 * @author treelite(c.xinle@gmail.com)
 */

var extend = require('../util/extend');

var types = {
    ejson: 'json'
};

function wrapType(handler) {
    return function (str) {
        this.ctype = str || this.ctype;
        if (str) {
            handler.call(this, types[str] || str);
        }
        return this.ctype;
    }
}

module.exports = function (app) {
    var server = app.server;
    return function (req, res, next) {
        // 添加App配置
        req.config = server.getConfig('app.json');

        // 初始化
        res.data = {};

        // 扩展params到query
        // 与firework保持一致
        req.query = extend(req.query || {}, req.param || {});

        // 扩展type功能
        res.type = wrapType(res.type);

        next();
    };
}
