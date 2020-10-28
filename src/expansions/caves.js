/*jslint node */
const expansion = require("./expansion.js");

const caves = (function iife() {
    "use strict";
    function initCaves(document, data) {
        data = expansion.init(document, data);
        return expansion.addMini({
            name: "Caves",
            id: "caves",
            href: "http://boardgamegeek.com/boardgameexpansion/132377",
            usageHref: "https://boardgamegeek.com/article/11970175",
            extra: {
                name: "placement",
                href: "http://boardgamegeek.com/article/10331765"
            },
            boards: ["Tavern"]
        }, data, document);
    }
    function updateCaves(data, presentData) {
        function boardTriggersCaves(data, boardList) {
            const minis = data.mini;
            return boardList.find(function hasCaveRule(boardData) {
                return minis.caves.includes(boardData.name);
            });
        }
        function updateCave(board) {
            board.cave = false;
            if (board.name.substring(0, 5) !== "Oasis") {
                board.cave = true;
            }
            return board;
        }
        if (boardTriggersCaves(data, presentData.boards)) {
            presentData.boards = presentData.boards.map(function (board) {
                return updateCave(board);
            });
        }
        return presentData;
    }
    function renderCaves(presentData, viewData) {
        function renderCave(presentBoard, boardData) {
            boardData.cave = "";
            if (presentBoard.cave) {
                boardData.cave = " (Cave)";
            }
            return boardData;
        }
        presentData.boards.map(function (presentBoard, i) {
            const boardData = viewData.boards[i];
            return renderCave(presentBoard, boardData);
        });
        return viewData;
    }
    function viewCaves(viewData, fields) {
        viewData.boards.forEach(function (boardData, i) {
            fields["board" + i].value = boardData.value + boardData.cave;
        });
        return viewData;
    }
    return {
        init: initCaves,
        update: updateCaves,
        render: renderCaves,
        view: viewCaves
    };
}());
module.exports = caves;
