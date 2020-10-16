/*jslint node, es6 */
const html = require("./html.js");
const cards = require("./cards.js");

const boards = (function () {
    "use strict";
    const boardNames = ["Oracle", "Farm", "Oasis", "Tower", "Tavern", "Barn", "Harbor", "Paddock"];
    function initBoards(document, data) {
        function addBoardsHTML(data) {
            const content = document.querySelector(".content");
            if (!document.querySelector(".boards")) {
                const boardsContainer = html.create("div", {class: "boards"});
                const heading = html.create("h3", {content: "MAP"});
                const board0 = html.create("output", {type: "text", id: "b0", size: "25"});
                const board1 = html.create("output", {type: "text", id: "b1", size: "25"});
                const board2 = html.create("output", {type: "text", id: "b2", size: "25"});
                const board3 = html.create("output", {type: "text", id: "b3", size: "25"});
                boardsContainer.appendChild(heading);
                boardsContainer.appendChild(board0);
                boardsContainer.appendChild(board1);
                boardsContainer.appendChild(board2);
                boardsContainer.appendChild(board3);
                content.insertBefore(boardsContainer, content.firstChild);
            }
            data.fields = data.fields || {};
            data.fields.boards = document.querySelector(".boards");
            data.fields.board0 = document.querySelector("#b0");
            data.fields.board1 = document.querySelector("#b1");
            data.fields.board2 = document.querySelector("#b2");
            data.fields.board3 = document.querySelector("#b3");
            return data;
        }
        html.init(document);
        data.names = data.names || [];
        if (!data.names.includes("base")) {
            data.names.push("base");
        }
        data.contents = data.contents || {};
        data.contents.boards = data.contents.boards || [];
        data.contents.boards.base = boardNames;
        data = addBoardsHTML(data);
        return data;
    }
    function addBoards(type, boards, data) {
        data.contents.boards[type] = boards;
        return data;
    }
    function getSelectedTypes(data, document) {
        const allBoards = data.contents.boards;
        const checkedTypes = Object.keys(allBoards).filter(function (type) {
            return document.querySelector("#" + type);
        }).filter(function (type) {
            return document.querySelector("#" + type).checked;
        });
        if (checkedTypes.length === 0) {
            return ["base"];
        }
        return checkedTypes;
    }
    function updateBoards(data, presentData, document) {
        function getBoardsOfType(boardsList, type) {
            const boardsOfType = boardsList[type];
            const mappedBoards = boardsOfType.map(
                (name) => ({name: name, type: type})
            );
            return mappedBoards;
        }
        function getBoards(data, selectedTypes) {
            const allBoards = data.contents.boards;
            const selectedBoards = Object.keys(allBoards).filter(
                (type) => selectedTypes.includes(type)
            );
            const boardsOfType = selectedBoards.map(
                (type) => getBoardsOfType(allBoards, type)
            );
            const boardsList = boardsOfType.reduce(
                (boardsList, boards) => boardsList.concat(boards),
                []
            );
            return boardsList;
        }
        function selectRandom(boardList, amount) {
            const shuffled = cards.shuffle(boardList);
            return cards.draw(shuffled, amount);
        }
        if (!document) {
            throw new Error("Missing document argument");
        }
        const selectedTypes = getSelectedTypes(data, document);
        const availableBoards = getBoards(data, selectedTypes);
        const randomBoards = selectRandom(availableBoards, 4);
        presentData.boards = randomBoards.map(function (board) {
            board.flipped = Math.random() > 0.5;
            return board;
        });
        return presentData;
    }
    function renderBoards(presentData, viewData) {
        function renderBoard(presentData, item) {
            if (presentData.name) {
                item.value = presentData.name;
            }
            if (presentData.type) {
                item.className = presentData.type;
            }
            if (presentData.flipped) {
                item.value += " (↷)";
            }
            return item;
        }
        viewData.boards = presentData.boards.map(function (boardConfig) {
            const boardTemplate = {value: "", className: ""};
            return renderBoard(boardConfig, boardTemplate);
        });
        return viewData;
    }
    function viewBoards(viewData, fields) {
        viewData.boards.forEach(function updateField(board, i) {
            fields["board" + i].value = board && board.value;
            fields["board" + i].setAttribute("class", board && board.className);
        });
        return viewData;
    }
    return {
        init: initBoards,
        addBoards,
        getSelectedTypes,
        update: updateBoards,
        render: renderBoards,
        view: viewBoards
    };
}());
module.exports = boards;
