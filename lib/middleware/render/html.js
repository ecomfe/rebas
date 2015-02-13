/**
 * @file 渲染HTML
 * @author treelite(c.xinle@gmil.com)
 */

var fs = require('fs');
var extend = require('../../util/extend');
var etpl = require('etpl');

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

/**
 * 构建HTML渲染中间件
 *
 * @public
 * @param {string} file 主页面路径
 * @return {function}
 */
module.exports = function (file) {
    var html = fs.readFileSync(file, 'utf-8');

    // 添加数据注入点
    html = html.replace('</head>', '${_data}\n</head>');

    var engine = new etpl.Engine({defaultFilter: 'raw'});
    var render = engine.compile(html);

    return function (req, res, next) {
        if (res.type() !== 'html' || !res.template) {
            return next();
        }

        res.render(res.template, extend({config: req.config}, res.data), function (err, content) {
            if (err) {
                return next(err);
            }

            var data = {
                config: req.config
            };
            // 添加附加数据
            data  = extend(data, res.addition);
            data._data = wrapInitialData(res.modelData || res.data);
            data.content = content;

            res.send(render(data));
            next();
        });
    };
};
