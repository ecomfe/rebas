/**
 * @file Init for Rquester
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (req, res, next) {
    // 为每个请求生成uid
    req.uid = Date.now().toString() + Math.floor(Math.random() * 1000);

    // 需要前后端同步的数据
    res.syncData = {};

    // 本次请求附加的静态模版变量
    res.templateData = {};

    next();
};
