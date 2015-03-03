/**
 * @file Init for Rquester
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (app) {

    return function (req, res, next) {
        // 为每个请求生成uuid
        req.uuid = Date.now().toString() + Math.floor(Math.random() * 1000);

        // 保存请求上下文
        var context = {req: req, res: res};
        app.setContext(context);

        next();
    };

};
