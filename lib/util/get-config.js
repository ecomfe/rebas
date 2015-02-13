/**
 * @file 获取配置信息
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var globalConfig = require('../config');
var cwd = process.cwd();

/**
 * 配置信息缓存
 *
 * @type {Object}
 */
var configs = {};

/**
 * 获取配置信息
 *
 * @public
 * @param {string} name 配置文件名称
 * @return {Object|Array}
 */
module.exports = function (name) {
    if (configs[name]) {
        return configs[name];
    }

    var res;
    var file = path.resolve(cwd, globalConfig.configDir, name + '.json');

    if (fs.existsSync(file)) {
        var data = fs.readFileSync(file, 'utf8');
        try {
            res = configs[name] = JSON.parse(data);
        }
        catch (e) {}
    }

    return res;
};
