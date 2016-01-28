/**
 * @file 错误处理
 * @author treelite(c.xinle@gmail.com)
 */
var logger = require('../log');

module.exports = function (error, req, res, next) {
    if (error instanceof Error) {
        logger.error(error.stack);
    }
    res.status(error && error.status || 500).end();
};
