/*jslint node, es6 */
const view = (function makeView() {
    "use strict";
    function renderView(parts, presentData) {
        const viewData = parts.reduce(function (viewData, part) {
            viewData = part.render(presentData, viewData);
            return viewData;
        }, {});
        return viewData;
    }
    function newUpdateView(presentData, parts, fields) {
        if (!presentData) {
            throw new Error("Missing presentData object");
        }
        const viewData = renderView(parts, presentData);
        parts.forEach(function (part) {
            part.view(viewData, fields);
        });
        return viewData;
    }
    return {
        update: newUpdateView
    };
}());
module.exports = view;
