/**
 * @file 渲染json
 * @author treelite(c.xinle@gmil.com)
 */

module.exports = function (req, res, next) {
    if (res.type() !== 'json') {
        return next();
    }

    res.json(res.data);
    next();
};
