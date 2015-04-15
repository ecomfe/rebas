/**
 * @file env
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 修复异步函数
 * 使之能在异步回调中恢复请求请求上下文
 *
 * @inner
 * @param {Object} app server
 */
function fixAsyncMethods(app) {

    /**
     * 包裹异步函数
     *
     * @param {Object} obj 模块
     * @param {string} name 方法名
     */
    function wrap(obj, name) {
        var method = obj[name];
        obj[name] = function (callback) {
            var args = [];
            for (var i = 1; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            var id = app.stashContext();
            args.unshift(function () {
                app.revertContext(id);
                callback.apply(null, arguments);
            });
            method.apply(this, args);
        };
    }

    var methods = ['setTimeout', 'setInterval', 'setImmediate'];
    methods.forEach(function (name) {
        wrap(global, name);
    });

    wrap(process, 'nextTick');
}

/**
 * 运行环境设置
 *
 * @public
 * @param {Object} app server
 */
module.exports = function (app) {
    // 修复异步函数
    fixAsyncMethods(app);
};
