/*jslint node, es6 */
const expansion = require("./expansion.js");

const capitol = (function iife() {
    "use strict";
    function initCapitols(document, data) {
        function addCapitol(document, data) {
            data = expansion.init(document, data);
            data = expansion.addMini({
                name: "Capitol",
                id: "capitol",
                href: "http://boardgamegeek.com/boardgameexpansion/109141",
                usageHref: "http://boardgamegeek.com/article/12458223#12458223",
                boards: ["Oracle", "Harbor"]
            }, data, document);
            return data;
        }
        if (!data || !data.contents) {
            throw new ReferenceError("Missing boards data");
        }
        if (!document.querySelector(".boards")) {
            throw new ReferenceError("Missing boards section");
        }
        if (!document.querySelector(".sidebar ul")) {
            data = expansion.init(document, data);
        }
        data = addCapitol(document, data);
        return data;
    }
    function updateCapitols(data, presentData) {
        function hasTwoCastles(boardName, data) {
            const miniExpns = data.mini;
            return miniExpns.capitol.includes(boardName);
        }
        function useCapitolRules(data) {
            const minis = expansion.getMinis(data);
            return minis.capitol === "rules";
        }
        function pickCapitolDirection() {
            return Math.random() < 0.5
                ? "N"
                : "S";
        }
        function updateCapitol(data, boardData) {
            const canUseCapitol = hasTwoCastles(boardData.name, data);
            boardData.capitol = {
                useCapitol: canUseCapitol && data.useCapitol,
                direction: pickCapitolDirection()
            };
            return boardData;
        }
        const capitolRules = useCapitolRules(data);
        const capitolOdds = expansion.checkMiniOdds(data, "capitol");
        data.useCapitol = capitolRules || capitolOdds;
        presentData.boards = presentData.boards.map(function (boardData) {
            return updateCapitol(data, boardData);
        });
        return presentData;
    }
    function renderCapitols(presentData, viewData) {
        function renderCapitol(config, boardView) {
            boardView.capitol = "";
            if (config.capitol.useCapitol) {
                const dir = config.capitol.direction;
                boardView.capitol = " (Capitol " + dir + ")";
            }
            return boardView;
        }
        viewData.boards = presentData.boards.map(function (boardData, i) {
            return renderCapitol(boardData, viewData.boards[i]);
        });
        return viewData;
    }
    function viewCapitols(viewData, fields) {
        viewData.boards.forEach(function (boardView, i) {
            fields["board" + i].value += boardView.capitol;
        });
        return viewData;
    }
    return {
        init: initCapitols,
        update: updateCapitols,
        render: renderCapitols,
        view: viewCapitols
    };
}());
module.exports = capitol;
