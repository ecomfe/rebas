/**
 * @file Register TPL extension
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');

require.extensions['.tpl'] = function (module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    module.exports = content;
};
