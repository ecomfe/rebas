/**
 * @file 渲染HTML
 * @author treelite(c.xinle@gmil.com)
 */

var fs = require('fs');
var extend = require('../../util/extend');

var KEY_TOKEN = 'rebas';
var REG_TOKEN = new RegExp('<!--\\s*' + KEY_TOKEN + '\\s*:\\s*([^ -]+)\\s*-->', 'g');

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

function wrapInitialData(data) {
    return '<script>'
        + 'window.rebas = '
        + toString(data || {})
        + '</script>';
}

module.exports = function (html) {
    var html = fs.readFileSync(html, 'utf-8');

    // 添加首屏数据的注入点
    html = html.replace('</head>', '<!--' + KEY_TOKEN + ':_data-->\n</head>');

    function format(data) {
        return html.replace(REG_TOKEN, function ($0, $1) {
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
            // 注入首屏数据
            addition._data = wrapInitialData(res.modelData || res.data);

            res.send(format(addition));
            next();
        });
    };
};
