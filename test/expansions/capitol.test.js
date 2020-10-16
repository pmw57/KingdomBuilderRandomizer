/*jslint node, es6 */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../../src/boards.js");
const expansion = require("../../src/expansions/expansion.js");
const capitol = require("../../src/expansions/capitol.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;
const {document} = new JSDOM(docpage).window;

describe("Capitol", function () {
    "use strict";
    let data;
    beforeEach(function () {
        data = {
            names: ["base"],
            miniNames: ["capitol"],
            contents: {
                boards: {
                    base: ["Oracle", "Farm", "Harbor", "Paddock"]
                }
            },
            mini: {
                capitol: ["Oracle", "Harbor"]
            }
        };
    });
    function useBoards(boardList) {
        return {
            boards: boardList.map(function (boardName) {
                return {name: boardName};
            })
        };
    }
    describe("errors", function () {
        it("throws an error when given no data", function () {
            expect(() => capitol.init()).to.throw(ReferenceError);
        });
        it("throws an error when no boards data", function () {
            expect(() => capitol.init({})).to.throw(ReferenceError);
        });
    });
    describe("init", function () {
        it("can init when sidebar is missing", function () {
            document.querySelector(".sidebar").remove();
            boards.init(document, data);
            expect(() => capitol.init(document, data)).to.not.throw();
        });
        it("lets you know when the boards section is missing", function () {
            if (document.querySelector(".boards")) {
                document.querySelector(".boards").remove();
            }
            data = {contents: []};
            expect(() => capitol.init(document, data)).to.throw("Missing boards section");
        });
        it("has no other view effect, as the boards section shows the capitol", function () {
            boards.init(document, data);
            expect(() => capitol.init(document, data)).to.not.throw();
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            expect(data.fields.capitol.parentNode).to.not.equal(undefined);
        });
    });
    describe("adds capitol when odds are good", function () {
        let cachedCheckMiniOdds;
        beforeEach(function () {
            cachedCheckMiniOdds = expansion.checkMiniOdds;
            document.querySelectorAll(".expansions").forEach((el) => el.remove());
            data = boards.init(document, data);
            data = capitol.init(document, data);
            document.querySelector("#capitolOdds").checked = true;
        });
        afterEach(function () {
            expansion.checkMiniOdds = cachedCheckMiniOdds;
        });
        it("with zero odds, doesn't use capitol", function () {
            document.querySelector("#capitolOddsOdds").value = "0";
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(false);
        });
        it("with low odds, doesn't use capitol", function () {
            expansion.checkMiniOdds = () => false;
            document.querySelector("#capitolOddsOdds").value = "50";
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(false);
        });
        it("with high odds, uses the capitol", function () {
            expansion.checkMiniOdds = () => true;
            document.querySelector("#capitolOddsOdds").value = "50";
            let presentData = useBoards(["Oracle"]);
            capitol.update(data, presentData, document);
            const boardList = presentData.boards;
            const capitolData = boardList[0].capitol;
            expect(capitolData.useCapitol).to.equal(true);
        });
        it("with maximum, uses the capitol", function () {
            expansion.checkMiniOdds = () => true;
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(true);
        });
    });
    describe("update", function () {
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
            document.querySelector("#capitolRules").checked = true;
            document.querySelectorAll(".expansions").forEach((el) => el.remove());
            data = expansion.init(document, data);
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("can initializes even when mini property isn't present", function () {
            delete data.mini;
            boards.init(document, data);
            capitol.init(document, data);
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(true);
        });
        it("Doesn't add a capitol when map has only one castle", function () {
            boards.init(document, data);
            capitol.init(document, data);
            let presentData = useBoards(["Farm"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(false);
        });
        it("Adds a capitol to the Oracle board", function () {
            boards.init(document, data);
            capitol.init(document, data);
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.useCapitol).to.equal(true);
        });
        it("uses a North direction when random is less than 0.5", function () {
            boards.init(document, data);
            capitol.init(document, data);
            Math.random = () => 0;
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.direction).to.equal("N");
        });
        it("uses a South direction when random is more than 0.5", function () {
            boards.init(document, data);
            capitol.init(document, data);
            Math.random = () => 0.75;
            let presentData = useBoards(["Oracle"]);
            presentData = capitol.update(data, presentData, document);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData.direction).to.equal("S");
        });
        it("Adds a capitol to multiple valid boards", function () {
            boards.init(document, data);
            capitol.init(document, data);
            let presentData = useBoards(["Oracle", "Farm", "Harbor", "Paddock"]);
            presentData = capitol.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0].capitol.useCapitol).to.equal(true);
            expect(boardList[1].capitol.useCapitol).to.equal(false);
            expect(boardList[2].capitol.useCapitol).to.equal(true);
            expect(boardList[3].capitol.useCapitol).to.equal(false);
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
        it("show no capitol when none is there", function () {
            presentData.boards[0].capitol.useCapitol = false;
            viewData = capitol.render(presentData, viewData);
            expect(viewData.boards[0].value).to.equal("testvalue");
        });
        it("shows the capitol on a board", function () {
            presentData.boards[0].capitol.useCapitol = true;
            viewData = capitol.render(presentData, viewData);
            expect(viewData.boards[0].capitol).to.equal(" (Capitol testdirection)");
        });
        it("has no side-effect on presentData", function () {
            presentData.boards[0].capitol.useCapitol = true;
            viewData = capitol.render(presentData, viewData);
            expect(presentData.boards[0].name).to.equal("present test");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
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
