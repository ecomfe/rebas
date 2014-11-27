/**
 * @file 渲染e-json
 * @author treelite(c.xinle@gmil.com)
 */

module.exports = function (req, res, next) {
    if (res.type() !== 'ejson') {
        return next();
    }

    var status = res.statusCode;
    if (status >= 200 && status < 300 || status === 304) {
        status = 0;
    }

    res.data = {
        status: status,
        data: res.data
    };

    res.type('json');
    res.status(200);
    next();
};
