/*jslint node, es6 */
const html = (function iife() {
    "use strict";
    let document;
    function init(doc) {
        document = doc;
    }
    function create(tagName, attrObj) {
        const tag = document.createElement(tagName);
        const attrs = Object.keys(attrObj || {});
        attrs.forEach(function (attr) {
            const value = attrObj[attr];
            if (attr === "content") {
                tag.innerHTML = value;
            } else {
                tag.setAttribute(attr, value);
            }
        });
        return tag;
    }
    return {
        init,
        create
    };
}());
module.exports = html;