/**
 * @file response扩展
 * @author treelite(c.xinle@gmail.com)
 */

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

module.exports = function (req, res, next) {
    res.type = wrapType(res.type);
    next();
};
