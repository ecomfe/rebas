/**
 * @file Init for Rquester
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (req, res, next) {

    // 为每个请求生成uuid
    req.uuid = Date.now().toString() + Math.floor(Math.random() * 1000); 

    next();

};
