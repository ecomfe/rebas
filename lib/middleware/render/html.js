/**
 * @file 渲染HTML
 * @author treelite(c.xinle@gmil.com)
 */

var TOKEN = new RegExp('<!--\\s*rebas\\s*:\\s*([^ -]+)\\s*-->', 'g');

var fs = require('fs');
var extend = require('../../util/extend');

/**
 * 字符串化变量
 *
 * @inner
 * @param {*} value
 * @return {string}
 */
function toString(value) {
    if (Array.isArray(value)
        || Object.prototype.toString.call(value) === '[object Object]'
    ) {
        return JSON.stringify(value);
    }

    return value.toString();
}

module.exports = function (html) {
    var html = fs.readFileSync(html, 'utf-8');

    function format(data) {
        return html.replace(TOKEN, function ($0, $1) {
            return $1 in data ? toString(data[$1]) : $0;
        });
    }

    return function (req, res, next) {
        if (res.type() !== 'html' || !res.template) {
            return next();
        }

        res.render(res.template, res.data, function (err, content) {
            if (err) {
                return next(err);
            }

            var addition = extend({}, res.addition || {});
            addition.content = content;
            addition.data = res.data;

            res.send(format(addition));
            next();
        });
    };
};
