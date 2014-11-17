/**
 * @file 渲染完整URL
 * @author treelite(c.xinle@gmil.com)
 */

var SPLIT = new RegExp('<!--\\s*content\\s*-->');

var fs = require('fs');

module.exports = function (html) {
    html = fs.readFileSync(html, 'utf-8');
    html = html.split(SPLIT);

    return function (req, res, next) {
        res.renderHTML = function (file, options) {
            var me = this;
            me.render(file, options, function (err, content) {
                if (err) {
                    return next(err);
                }
                me.send(html[0] + content + html[1]);
            });
        };
        next();
    };
};
