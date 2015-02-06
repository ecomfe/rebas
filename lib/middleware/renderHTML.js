/**
 * @file Render html
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var etpl = require('etpl');
etpl = new etpl.Engine({
    defaultFilter: 'raw'
});

var INDEX_FILE = 'index.html';
var content = fs.readFileSync(INDEX_FILE, 'utf8');

// 插入同步数据的注入点
content = content.replace('</head>', '<!-- if: ${model} --><script>window.__rebas__ = ${model}</script>\n<!-- /if --></head>');

var renderHTML = etpl.compile(content);

module.exports = function (req, res, next) {
    if (res.hasOwnProperty('html')) {
        var data = JSON.stringify(res.data);
        res.send(renderHTML({content: res.html, model: data}));
    }
    next();
};
