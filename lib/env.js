/**
 * @file env
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 函数包装记录
 *
 * @type {Array.<Object>}
 */
var wrappers = [];

/**
 * 包装函数
 * 处理app的上下文切换
 *
 * @inner
 * @param {Object} obj 模块
 * @param {string} name 方法名
 * @param {Object} app app
 */
function wrapMethod(obj, name, app) {
    var method = obj[name];

    // 保存原始内容
    wrappers.push({
        obj: obj,
        name: name,
        method: method
    });

    obj[name] = function (callback) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        var ctx = app.getContext();
        args.unshift(function () {
            app.revertContext(ctx);
            ctx = null;
            callback.apply(null, arguments);
        });

        return method.apply(this, args);
    };
}

/**
 * 解除所有的包装函数
 *
 * @inner
 */
function unwrapAllMethods() {
    wrappers.forEach(function (item) {
        var obj = item.obj;
        obj[item.name] = item.method;
    });
    wrappers = [];
}

/**
 * 启用环境设置
 *
 * @public
 * @param {Object} app app
 */
exports.enable = function (app) {
    // 包装所以的异步函数
    // 处理上下文切换
    var methods = ['setTimeout', 'setInterval', 'setImmediate'];
    methods.forEach(function (name) {
        wrapMethod(global, name, app);
    });

    wrapMethod(process, 'nextTick', app);
};

/**
 * 关闭环境设置
 *
 * @public
 */
exports.disable = function () {
    unwrapAllMethods();
};
