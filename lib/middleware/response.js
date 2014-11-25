/**
 * @file response扩展
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
    return function (req, res, next) {
        var time = Date.now();
        // 添加App配置
        req.appConfig = extend({}, app.config);
        // 扩展type功能
        res.type = wrapType(res.type);

        res.on('finish', function () {
            console.log(req.originalUrl + ' times:' + (Date.now() - time));
        });

        next();
    };
}
