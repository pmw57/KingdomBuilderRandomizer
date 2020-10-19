/*jslint node */
const presenter = (function makePresenter() {
    "use strict";
    function initPresenter(data) {
        return data;
    }
    function updatePresenter(data, parts, document) {
        let presentData = parts.reduce(function (presentData, part) {
            return part.update(data, presentData, document);
        }, {});
        return presentData;
    }
    return {
        init: initPresenter,
        update: updatePresenter
    };
}());
module.exports = presenter;
