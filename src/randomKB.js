/*jslint node, es6 */
const storage = require("./storage.js");
const boards = require("./boards.js");
const goals = require("./goals.js");
const players = require("./players.js");
const presenter = require("./presenter.js");
const view = require("./view.js");

const randomKingdomBuilder = (function makeRandomKingdomBuilder() {
    "use strict";
    function loadExpansions(expansionList) {
        return expansionList.map(function (partName) {
            return require("./expansions/" + partName + ".js");
        });
    }
    function initRandomKB(config, document) {
        function newBoardSetup(config, document) {
            const expansionParts = loadExpansions(config.expansions || []);
            const parts = [
                boards,
                goals,
                players
            ].concat(expansionParts);
            let data = {};
            data = parts.reduce(function (data, part) {
                data = part.init(document, data);
                return data;
            }, {});
            if (document.defaultView.localStorage) {
                storage.init(document);
                storage.update();
                storage.monitor();
            }
            let presentData = presenter.update(data, parts, document);
            view.update(presentData, parts, data.fields);
        }
        function buttonClickWrapper(config) {
            return function buttonClickHandler() {
                newBoardSetup(config, document);
            };
        }
        const button = document.querySelector(".randomSetup");
        button.addEventListener("click", buttonClickWrapper(config));
        button.click();
    }
    return {
        init: initRandomKB
    };
}());
module.exports = randomKingdomBuilder;
