/**
 * @file Render html
 * @author treelite(c.xinle@gmail.com)
 */

var extend = require('saber-lang').extend;
var config = require('../config');
var INDEX_FILE = 'index.html';

/**
 * 模版编译
 *
 * @inner
 * @param {Object=} options 配置项
 * @param {string=} options.indexFile 首页模版
 * @return {Function}
 */
function compile(options) {
    options = options || {};
    var fs = require('fs');
    var content = fs.readFileSync(options.indexFile || INDEX_FILE, 'utf8');
    // 插入同步数据的注入点
    content = content.replace('</head>', '<script>window.__rebas__ = ${rebas}</script>\n</head>');

    var etpl = require('etpl');
    etpl = new etpl.Engine({defaultFilter: 'raw'});
    return etpl.compile(content);
}

/**
 * 生成页面渲染中间件
 *
 * @public
 * @param {Object} options 配置参数
 * @return {Function}
 */
module.exports = function (options) {
    var render = compile(options);
    return function (req, res, next) {
        if (res.hasOwnProperty('html')) {
            var data = extend({}, res.templateData, {content: res.html});
            // 传输需要同步的数据
            data.rebas = JSON.stringify(
                // 合并全局的待同步数据
                extend(
                    {},
                    config.syncData,
                    res.syncData,
                    {
                        model: res.data,
                        templateData: options.templateData || {}
                    }
                )
            );
            // 转义危险字符
            // " ' \ 已经被JSON.stringify 处理了，还剩下一个 /
            data.rebas = data.rebas.replace(/\//g, '\\/');
            // 附加全局的模版数据
            data = extend({}, options.templateData, data);
            // 渲染HTML页面
            return res.send(render(data));
        }
        next();
    };
};
