/**
 * @file Element spec
 * @author treelite(c.xinle@gmail.com)
 */

var Element = require('../lib/Element');

describe('Element', function () {
    
    describe('get outerHTML', function () {

        it('without className', function () {
            var ele = new Element('div');

            expect(ele.outerHTML).toEqual('<div>\n</div>');

            ele.innerHTML = 'hello';
            expect(ele.outerHTML).toEqual('<div>\nhello\n</div>');
        });

        it('with className', function () {
            var ele = new Element('div');

            ele.className = 'test';
            expect(ele.outerHTML).toEqual('<div class="test">\n</div>');
        });

    });

});
