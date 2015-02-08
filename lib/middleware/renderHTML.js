/**
 * @file Render html
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var config = require('../config');
var extend = require('saber-lang').extend;
var tplInfo = config.tpl;

var etpl = require('etpl');
var options = extend({}, tplInfo.config, {defaultFilter: 'raw'});
delete options.filters;
etpl = new etpl.Engine(options);

// 附加过滤器
var filters = tplInfo.config.filters || [];
filters.forEach(function (filter) {
    etpl.AddFilter(filter);
});
delete tplInfo.config.filters;

var INDEX_FILE = 'index.html';
var content = fs.readFileSync(INDEX_FILE, 'utf8');

// 插入同步数据的注入点
content = content.replace('</head>', '<!-- if: ${model} --><script>window.__rebas__ = ${model}</script>\n<!-- /if --></head>');
// 模版配置注入点
content = content.replace('</head>', '<!-- if: ${tplInfo} --><script>window.__rebasTplInfo__ = ${tplInfo}</script>\n<!-- /if --></head>')

var renderHTML = etpl.compile(content);

module.exports = function (req, res, next) {
    if (res.hasOwnProperty('html')) {
        var data = {
            content: res.html,
            model: JSON.stringify(res.data),
            tplInfo: JSON.stringify(tplInfo)
        };

        // 附加全局的模版数据
        data = extend({}, config.tpl.data, data);
        res.send(renderHTML(data));
    }
    next();
};
