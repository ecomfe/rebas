/**
 * @file Env spec
 * @author treelite(c.xinle@gmail.com)
 */

var env = require('../lib/env');

describe('Env', function () {
    var orgSetTimeout = global.setTimeout;
    var app = {};

    app.getContext = jasmine.createSpy('getContext');
    app.revertContext = jasmine.createSpy('revertContext');

    beforeEach(function () {
        env.enable(app);
    });

    afterEach(function () {
        env.disable();
        app.getContext.calls.reset();
        app.revertContext.calls.reset();
    });

    it('setTimeout', function (done) {
        var timer = setTimeout(function () {
            expect(app.revertContext.calls.count()).toBe(1);
            done();
        }, 100);

        expect(app.getContext.calls.count()).toBe(1);
        expect(timer).toBeDefined();
    });

    it('setInterval', function (done) {
        var timer = setInterval(function () {
            expect(app.revertContext.calls.count()).toBe(1);

            clearInterval(timer);

            orgSetTimeout(function () {
                expect(app.getContext.calls.count()).toBe(1);
                expect(app.revertContext.calls.count()).toBe(1);
                done();
            }, 300);

        }, 100);

        expect(app.getContext.calls.count()).toBe(1);
        expect(timer).toBeDefined();
    });

    it('setImmediate', function (done) {
        var timer = setImmediate(
            function (a, b) {
                expect(a).toEqual('treelite');
                expect(b).toEqual(10);
                expect(app.revertContext.calls.count()).toBe(1);
                done();
            },
            'treelite',
            10
        );

        expect(app.getContext.calls.count()).toBe(1);
        expect(timer).toBeDefined();
    });

    it('process.nextTick', function (done) {
        process.nextTick(function () {
            expect(app.revertContext.calls.count()).toBe(1);
            done();
        });

        expect(app.getContext.calls.count()).toBe(1);
    });

});
