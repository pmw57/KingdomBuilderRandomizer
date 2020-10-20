/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../../src/boards.js");
const expansion = require("../../src/expansions/expansion.js");
const capitol = require("../../src/expansions/capitol.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Capitol", function () {
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
    describe("errors", function () {
        it("throws an error when given no data", function () {
            expect(() => capitol.init()).to.throw("Missing boards data");
        });
        it("throws an error when no boards data", function () {
            expect(() => capitol.init({})).to.throw("Missing boards data");
        });
        it("lets you know when the boards section is missing", function () {
            let data = {
                contents: {
                    boards: []
                }
            };
            expect(
                () => capitol.init(document, data)
            ).to.throw("Missing boards section");
        });
    });
    describe("init", function () {
        let data;
        beforeEach(function () {
            data = {};
        });
        it("creates a sidebar during init", function () {
            boards.init(document, data);
            expect(document.querySelector(".sidebar")).to.equal(null);
            expect(() => capitol.init(document, data)).to.not.throw();
            expect(document.querySelector(".sidebar").nodeType).to.equal(1);
        });
        it("creates a capitol checkbox", function () {
            data = {};
            data = boards.init(document, data);
            expect(document.querySelector("#capitol")).to.equal(null);
            data = capitol.init(document, data);
            expect(document.querySelector("#capitol").checked).to.equal(true);
        });
        it("can initializes when mini property isn't present", function () {
            delete data.mini;
            data = boards.init(document, data);
            data = capitol.init(document, data);
            expect(Array.isArray(data.mini.capitol)).to.equal(true);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            expect(data.fields.capitol.parentNode).to.not.equal(undefined);
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            expect(data.fields.capitol.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        let data;
        let cacheRandom;
        beforeEach(function () {
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("Doesn't add a capitol when map has only one castle", function () {
            let presentData = createBoardList(["Farm"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(false);
        });
        it("Adds a capitol to the Oracle board", function () {
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(true);
        });
        it("uses a North direction when random is less than 0.5", function () {
            Math.random = () => 0;
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.direction).to.equal("N");
        });
        it("uses a South direction when random is more than 0.5", function () {
            Math.random = () => 0.75;
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.direction).to.equal("S");
        });
        it("Adds a capitol to multiple valid boards", function () {
            let presentData = createBoardList(
                ["Oracle", "Farm", "Harbor", "Paddock"]
            );
            presentData = capitol.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0].capitol.useCapitol).to.equal(true);
            expect(boardList[1].capitol.useCapitol).to.equal(false);
            expect(boardList[2].capitol.useCapitol).to.equal(true);
            expect(boardList[3].capitol.useCapitol).to.equal(false);
        });
    });
    describe("When rules are used", function () {
        let data;
        let cachedCheckMiniOdds;
        beforeEach(function () {
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            document.querySelector("#capitolRules").checked = true;
            cachedCheckMiniOdds = expansion.checkMiniOdds;
        });
        afterEach(function () {
            expansion.checkMiniOdds = cachedCheckMiniOdds;
        });
        it("Uses Capitol on Oracle, but not on Farm", function () {
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            expect(presentData.boards[0].capitol.useCapitol).to.equal(false);
            expect(presentData.boards[1].capitol.useCapitol).to.equal(true);
        });
    });
    describe("When odds are used", function () {
        let data;
        let cachedCheckMiniOdds;
        beforeEach(function () {
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            document.querySelector("#capitolOdds").checked = true;
            cachedCheckMiniOdds = expansion.checkMiniOdds;
        });
        afterEach(function () {
            expansion.checkMiniOdds = cachedCheckMiniOdds;
        });
        it("with zero odds, doesn't use capitol", function () {
            document.querySelector("#capitolOddsOdds").value = "0";
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            expect(presentData.boards[0].capitol.useCapitol).to.equal(false);
            const capitolData = presentData.boards[1].capitol;
            expect(capitolData.useCapitol).to.equal(false);
        });
        it("with low odds, doesn't use capitol", function () {
            expansion.checkMiniOdds = () => false;
            document.querySelector("#capitolOddsOdds").value = "50";
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            expect(presentData.boards[0].capitol.useCapitol).to.equal(false);
            const capitolData = presentData.boards[1].capitol;
            expect(capitolData.useCapitol).to.equal(false);
        });
        it("with high odds, uses the capitol", function () {
            expansion.checkMiniOdds = () => true;
            document.querySelector("#capitolOddsOdds").value = "50";
            let presentData = createBoardList(["Farm", "Oracle"]);
            capitol.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(presentData.boards[0].capitol.useCapitol).to.equal(false);
            const capitolData = boardList[1].capitol;
            expect(capitolData.useCapitol).to.equal(true);
        });
        it("with maximum, uses the capitol", function () {
            expansion.checkMiniOdds = () => true;
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData, document);
            expect(presentData.boards[0].capitol.useCapitol).to.equal(false);
            const capitolData = presentData.boards[1].capitol;
            expect(capitolData.useCapitol).to.equal(true);
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
            expect(presentData.boards[0].name).to.equal("present test");
        });
        it("doesn't show a capitol when a board doesn't have one", function () {
            presentData.boards[0].capitol.useCapitol = false;
            viewData = capitol.render(presentData, viewData);
            expect(viewData.boards[0].capitol).to.equal("");
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
        });
        it("passes through viewData", function () {
            let viewData = {boards: []};
            viewData.test = "successful test";
            viewData = capitol.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
        it("adds capitol to the board", function () {
            data = boards.init(document, data);
            const board = document.querySelector("#b0");
            let viewData = {boards: [
                {value: "test board", capitol: " (Capitol N)"}
            ]};
            viewData = boards.view(viewData, data.fields);
            viewData = capitol.view(viewData, data.fields);
            expect(board.value).to.equal("test board (Capitol N)");
        });
    });
});
