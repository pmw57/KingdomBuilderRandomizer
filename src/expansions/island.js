/*jslint node */
const html = require("../html.js");
const expansion = require("./expansion.js");

const island = (function () {
    "use strict";
    const href = "http://boardgamegeek.com/boardgameexpansion/156102";
    const usageHref = "https://www.kickstarter.com/projects/1016374822";
    const islandBoards = ["Harbor", "Lighthouse"];
    function initIsland(document, data) {
        function addIslandHTML(data) {
            const boards = document.querySelector(".boards");
            const islandField = html.create("output", {type: "text", id: "i0"});
            boards.appendChild(islandField);
            return data;
        }
        html.init(document);
        data = expansion.init(document, data);
        if (!document.querySelector("#i0")) {
            data = addIslandHTML(data);
        }
        data.fields.i0 = document.querySelector("#i0");
        return expansion.addMini({
            name: "Island",
            id: "island",
            href,
            usageHref,
            boards: islandBoards
        }, data, document);
    }
    function isWaterBoard(boardName, data) {
        const miniExpns = data.mini;
        return miniExpns.island.includes(boardName);
    }
    function updateIsland(data, presentData, ignore) {
        function chooseRotation() {
            if (Math.random() >= 0.5) {
                return true;
            }
            return false;
        }
        function hasWaterBoard(boardList, data) {
            return boardList.map(
                (board) => board.name
            ).some(
                (boardName) => isWaterBoard(boardName, data)
            );
        }
        function islandOdds(data) {
            return expansion.shouldUseMini(data, "island");
        }
        presentData.island = {
            useIsland: false,
            flipped: false
        };
        const boardList = presentData.boards;
        if (!hasWaterBoard(boardList, data)) {
            return presentData;
        }
        const miniSettings = expansion.getMinis(data);
        const islandSettings = miniSettings.island;
        const useRules = (islandSettings === "rules");
        const useOdds = (islandSettings === "odds" && islandOdds(data));
        if (useRules || useOdds) {
            presentData.island.useIsland = true;
            presentData.island.flipped = chooseRotation();
        }
        return presentData;
    }
    function renderIsland(presentData, viewData) {
        function islandRenderer(islandConfig) {
            const item = {value: ""};
            if (!islandConfig) {
                return item;
            }
            if (islandConfig.useIsland) {
                item.value = "Island";
                item.type = "island";
            }
            if (islandConfig.flipped) {
                item.value += " (↷)";
            }
            return item;
        }
        const islandConfig = presentData.island;
        viewData.island = islandRenderer(islandConfig);
        return viewData;
    }
    function viewIsland(viewData, fields) {
        const islandView = viewData.island;
        fields.i0.value = islandView.value;
        fields.i0.className = islandView.type;
        return viewData;
    }
    return {
        isWaterBoard,
        init: initIsland,
        update: updateIsland,
        render: renderIsland,
        view: viewIsland
    };
}());
module.exports = island;
