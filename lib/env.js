/**
 * @file env
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 修复全局的异步函数
 * 使之能在异步回调中恢复请求请求上下文
 *
 * @inner
 * @param {Object} app server
 */
function fixGlobalMethods(app) {
    var methods = ['setTimeout', 'setInterval', 'setImmediate'];

    methods.forEach(function (name) {
        var method = global[name];
        global[name] = function (callback) {
            var args = Array.prototype.slice.call(arguments, 1);
            var context = app.getContext();
            args.unshift(function () {
                process.nextTick(function () {
                    app.setContext(context);
                    callback();
                });
            });
            method.apply(null, args);
        };
    });
}

/**
 * 运行环境设置
 *
 * @public
 * @param {Object} app server
 */
module.exports = function (app) {
    // 修复全局异步函数
    fixGlobalMethods(app);
};
