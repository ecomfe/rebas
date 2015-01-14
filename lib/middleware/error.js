/**
 * @file 默认的错误处理
 * @author treelite(c.xinle@gmail.com)
 */

var log = require('../log').get(__filename)

module.exports = function (err, req, res, next) {
    log.error(err.stack);
    res.status(500).send('Server Error');
};
