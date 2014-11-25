/**
 * @file 读取配置信息
 * @author treelite(c.xinle@gmail.com)
 */

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

    if (fs.existsSync(file)) {
        res = require(file);
    }

    return res;
};
