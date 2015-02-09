/**
 * @file 错误处理
 * @author treelite(c.xinle@gmail.com)
 */

module.exports = function (error, req, res, next) {
    var logger = require('../log');
    if (error instanceof Error) {
        logger.error(error.stack);
    }
    res.status(500).end();
};
