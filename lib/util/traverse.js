/**
 * @file 文件夹遍历
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var path = require('path');

/**
 * 文件名检测
 *
 * @inner
 * @param {string} file 文件名
 * @param {RegExp|Function} pattern 匹配模式
 * @return {boolean}
 */
function detect(file, pattern) {
    if (pattern instanceof RegExp) {
        return pattern.test(file);
    }
    else if (typeof pattern === 'function') {
        return pattern(file);
    }
    return false;
}

/**
 * 遍历文件夹
 *
 * @inner
 * @param {string|Array.<string>} dir 搜索目标文件夹
 * @param {RegExp|Function} pattern 文件匹配模式
 * @param {Array=} files 已找到的文件
 * @return {Array}
 */
function traverse(dir, pattern, files) {
    files = files || [];

    if (Array.isArray(dir)) {
        dir.forEach(function (item) {
            traverse(item, pattern, files);
        });
        return files;
    }

    var items = fs.readdirSync(dir);
    items.forEach(function (file) {
        file = path.resolve(dir, file);
        var stat = fs.statSync(file);
        if (stat.isFile() && detect(file, pattern)) {
           files.push(file);
        }
        if (stat.isDirectory()) {
            traverse(file, pattern, files);
        }
    });

    return files;
}

module.exports = traverse;
