/**
 * @file 读取配置信息
 * @author treelite(c.xinle@gmail.com)
 */

var configs = {};

/**
 * 读取配置信息
 * json后缀名文件
 *
 * @public
 * @param {string} file
 * @return {*}
 */
module.exports = function (file) {
    var fs = require('fs');
    var res;

    if (configs[file]) {
        res = configs[file];
    }
    else if (fs.existsSync(file)) {
        file = fs.readFileSync(file, 'utf8');
        configs[file] = res = JSON.parse(file);
    }

    return res;
};
