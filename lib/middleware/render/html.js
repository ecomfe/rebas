/**
 * @file 渲染HTML
 * @author treelite(c.xinle@gmil.com)
 */

var SPLIT = new RegExp('<!--\\s*content\\s*-->');

var fs = require('fs');

module.exports = function (html) {
    var wrapper = fs.readFileSync(html, 'utf-8');
    wrapper = wrapper.split(SPLIT);

    return function (req, res, next) {
        if (res.type() !== 'html' || !res.template) {
            return next();
        }

        res.render(res.template, res.data, function (err, content) {
            if (err) {
                return next(err);
            }
            res.send(wrapper[0] + content + wrapper[1]);
            next();
        });
    };
};
