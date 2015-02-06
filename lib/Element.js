/**
 * @file Visual element
 * @author treelite(c.xinle@gmail.com)
 */

/**
 * 获取外层的HTML
 *
 * @inner
 * @return {string}
 */
function getOuterHTML() {
    var sTag = '<' + this.tagName;
    if (this.className) {
        sTag += ' class="' + this.className + '"';
    }
    sTag += '>';

    var html = [sTag];
    html.push(this.innerHTML);
    html.push('</' + this.tagName + '>');

    return html.join('\n');
}

/**
 * Element
 *
 * @constructor
 * @param {string} tagName 标签名称
 */
function Element(tagName) {
    this.tagName = tagName.toLowerCase();

    this.innerHTML = '';
    this.className = '';

    Object.defineProperty(this, 'outerHTML', {
        get: getOuterHTML.bind(this)
    });
}

module.exports = Element;
