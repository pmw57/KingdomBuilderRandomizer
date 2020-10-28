/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const capitol = require("../../src/expansions/capitol.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Capitol Unit tests", function () {
    "use strict";
    let document;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
    });
    function createBoardList(boardList) {
        // removes the need to call boards.update() during test
        return {
            boards: boardList.map(function (boardName) {
                return {name: boardName};
            })
        };
    }
    function addCapitol(data) {
        data.mini = data.mini || {};
        data.mini.capitol = ["Oracle", "Harbor"];
        data.fields = data.fields || {};
        const capitolCheckbox = document.createElement("input");
        capitolCheckbox.id = "capitol";
        capitolCheckbox.checked = true;
        data.fields.capitol = capitolCheckbox;
        const rulesCheckbox = document.createElement("input");
        rulesCheckbox.id = "capitolRules";
        rulesCheckbox.checked = true;
        data.fields.capitolRules = rulesCheckbox;
        const oddsChecked = document.createElement("input");
        oddsChecked.id = "capitolRules";
        oddsChecked.checked = false;
        data.fields.capitolOdds = oddsChecked;
        const oddsOdds = document.createElement("input");
        rulesCheckbox.id = "capitolOddsOdds";
        data.fields.capitolOddsOdds = oddsOdds;
        data.fields.board0 = {value: ""};
        return data;
    }
    describe("init", function () {
        let data;
        beforeEach(function () {
            data = {
                contents: {
                    boards: {}
                }
            };
            const content = document.createElement("div");
            content.classList.add("content");
            const boards = document.createElement("div");
            boards.classList.add("boards");
            document.body.appendChild(content);
            content.appendChild(boards);
        });
        it("creates a sidebar during init", function () {
            expect(document.querySelector(".sidebar")).to.equal(null);
            data = capitol.init(document, data);
            expect(document.querySelector(".sidebar")).to.have.tagName("DIV");
        });
        it("creates a capitol checkbox", function () {
            data = capitol.init(document, data);
            const capitolCheckbox = document.querySelector("#capitol");
            expect(capitolCheckbox).to.have.property("checked", true);
        });
        it("can initializes when mini property isn't present", function () {
            delete data.mini;
            data = capitol.init(document, data);
            expect(data.mini.capitol).is.an("array");
        });
        it("can init multiple times", function () {
            data = capitol.init(document, data);
            let capitolField = data.fields.capitol;
            expect(capitolField.parentNode).to.not.equal(undefined);
            // innerHTML in second init used to ruin previous references
            data = capitol.init(document, data);
            capitolField = data.fields.capitol;
            expect(capitolField.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        let data;
        let cacheRandom;
        beforeEach(function () {
            data = {};
            data = addCapitol(data);
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("uses capitol input field", function () {
            let presentData = {boards: []};
            capitol.update(data, presentData, document);
        });
        it("Doesn't add a capitol when map has only one castle", function () {
            let presentData = createBoardList(["Farm"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("useCapitol", false);
        });
        it("Adds a capitol to the Oracle board", function () {
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("useCapitol", true);
        });
        it("uses a North direction when random is less than 0.5", function () {
            Math.random = () => 0;
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("direction", "N");
        });
        it("uses a South direction when random is more than 0.5", function () {
            Math.random = () => 0.75;
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("direction", "S");
        });
        it("Adds a capitol to multiple valid boards", function () {
            let presentData = createBoardList(
                ["Oracle", "Farm", "Harbor", "Paddock"]
            );
            presentData = capitol.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0].capitol).to.have.property("useCapitol", true);
            expect(boardList[1].capitol).to.have.property("useCapitol", false);
            expect(boardList[2].capitol).to.have.property("useCapitol", true);
            expect(boardList[3].capitol).to.have.property("useCapitol", false);
        });
    });
    describe("When rules are used", function () {
        let data;
        beforeEach(function () {
            data = {};
            data = addCapitol(data);
        });
        it("Uses Capitol on Oracle, but not on Farm", function () {
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const boardsList = presentData.boards;
            expect(boardsList[0].capitol).to.have.property("useCapitol", false);
            expect(boardsList[1].capitol).to.have.property("useCapitol", true);
        });
    });
    describe("When odds are used", function () {
        let data;
        let rulesField;
        let oddsField;
        let oddsOdds;
        beforeEach(function () {
            data = {};
            data = addCapitol(data);
            rulesField = data.fields.capitolRules;
            rulesField.checked = false;
            oddsField = data.fields.capitolOdds;
            oddsField.checked = true;
            oddsOdds = data.fields.capitolOddsOdds;
            oddsOdds.value = "50";
        });
        it("with low odds, doesn't use capitol", function () {
            oddsOdds.value = "0";
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const boardsList = presentData.boards;
            let capitolData = boardsList[0].capitol;
            expect(capitolData).to.have.property("useCapitol", false);
            capitolData = boardsList[1].capitol;
            expect(capitolData).to.have.property("useCapitol", false);
        });
        it("with high odds, uses the capitol", function () {
            oddsOdds.value = "100";
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const boardsList = presentData.boards;
            expect(boardsList[0].capitol).to.have.property("useCapitol", false);
            const capitolData = boardsList[1].capitol;
            expect(capitolData).to.have.property("useCapitol", true);
        });
    });
    describe("render", function () {
        let presentData;
        let viewData;
        beforeEach(function () {
            presentData = {
                boards: [
                    {
                        name: "present test",
                        capitol: {
                            useCapitol: true,
                            direction: "testdirection"
                        }
                    }
                ]
            };
            viewData = {
                boards: [
                    {value: "testvalue"}
                ]
            };
        });
        it("has no side-effect on presentData", function () {
            presentData.boards[0].capitol.useCapitol = true;
            viewData = capitol.render(presentData, viewData);
            const boardsList = presentData.boards;
            expect(boardsList[0]).to.have.property("name", "present test");
        });
        it("doesn't show a capitol when a board doesn't have one", function () {
            presentData.boards[0].capitol.useCapitol = false;
            viewData = capitol.render(presentData, viewData);
            expect(viewData.boards[0]).to.have.property("capitol", "");
        });
        it("shows the capitol on a board", function () {
            presentData.boards[0].capitol.useCapitol = true;
            viewData = capitol.render(presentData, viewData);
            const capitolValue = viewData.boards[0].capitol;
            expect(capitolValue).to.equal(" (Capitol testdirection)");
        });
    });
    describe("view", function () {
        let data;
        beforeEach(function () {
            data = {};
            data = addCapitol(data);
        });
        it("passes through viewData", function () {
            let viewData = {boards: []};
            viewData.test = "successful test";
            viewData = capitol.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("adds capitol to the board", function () {
            data.fields.board0 = {value: ""};
            data = addCapitol(data);
            const board = data.fields.board0;
            let viewData = {boards: [
                {value: "test board", capitol: " (Capitol N)"}
            ]};
            viewData = capitol.view(viewData, data.fields);
            expect(board).to.have.property("value", " (Capitol N)");
        });
    });
});
