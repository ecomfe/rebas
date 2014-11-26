/**
 * @file 对象扩展
 * @author treelite(c.xinle@gmail.com)
 */


/**
 * 对象扩展
 *
 * @public
 * @param {Object} target
 * @param {Object} source
 * @return {Object}
 */
module.exports = function (target, source) {
    if (!source) {
        return target;
    }

    Object.keys(source).forEach(function (key) {
        target[key] = source[key];
    });

    return target;
}
