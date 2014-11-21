/**
 * @file 渲染e-json
 * @author treelite(c.xinle@gmil.com)
 */

module.exports = function (req, res, next) {
    if (res.type() !== 'ejson') {
        return next();
    }

    res.data = {
        status: res.status || res.statusCode || 0,
        data: res.data
    };
    res.type('json');
    res.status(200);
    next();
};
