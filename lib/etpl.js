/**
 * @file etpl for express
 * @author treelite(c.xinle@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var etpl = require('etpl');

var commonTemplates = [];
var engines = {};

/**
 * 创建etpl实例
 *
 * @inner
 * @param {string} file 模版文件路径
 * @param {Function} callback
 */
function make(file, callback) {
    var templates = [].concat(commonTemplates);

    function compile() {
        var tpl = templates.join('\n');
        var engine = new etpl.Engine();

        // 复制配置与filter
        engine.options = etpl.options;
        engine.filters = etpl.filters;

        var defRender;
        try {
            defRender = engine.compile(tpl);
        }
        catch (e) {
            callback(e);
            return;
        }

        var oldRender = engine.render;
        engine.render = function (target, data) {
            if (!target) {
                return defRender(data);
            }
            else {
                return oldRender.call(this, target, data);
            }
        };

        callback(null, engine);
    }

    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        templates.unshift(data);
        compile();
    });
}

/**
 * 渲染模版
 *
 * @public
 * @param {string} file 模块文件路径，如果需要使用其中的某一个target，可以使用`path#target`的形势
 * @param {Object} data 模版数据
 * @param {Function} callback
 */
module.exports = function (file, data, callback) {
    data = data || {};
    file = file.split('#');
    var target = file[1];
    file = file[0];

    var engine = engines[file];

    if (!engine) {
        make(file, function (err, engine) {
            if (err) {
                callback(err);
                return;
            }
            engines[file] = engine;
            callback(null, engine.render(target, data));
        });
    }
    else {
        callback(null, engine.render(target, data));
    }
};

/**
 * 加载公共的模版
 *
 * @public
 * @param {string} dir 公共模版文件路径或者目录
 */
module.exports.load = function (dir) {
    var files = [];

    function append(item) {
        files.push(path.resolve(file, item));
    }

    if (fs.existsSync(dir)) {
        files.push(dir);
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var stat = fs.statSync(file);
            if (stat.isFile() && path.extname(file) === '.tpl') {
                commonTemplates.push(fs.readFileSync(file, 'utf-8'));
            }
            else if (stat.isDirectory()) {
                fs.readdirSync(file).forEach(append);
            }
        }
    }
};
