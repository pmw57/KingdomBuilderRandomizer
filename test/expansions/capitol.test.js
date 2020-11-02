/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const capitol = require("../../src/expansions/capitol.js");

describe("Capitol Unit tests", function () {
    "use strict";
    function createBoardList(boardList) {
        // removes the need to call boards.update() during test
        return {
            boards: boardList.map(function (boardName) {
                return {name: boardName};
            })
        };
    }
    function fakeCheckbox(id, checked) {
        return {id, checked};
    }
    function fakeInput(id, value) {
        return {id, value};
    }
    function addCapitol(data) {
        data.mini = data.mini || {};
        data.mini.capitol = ["Oracle", "Harbor"];
        data.fields = data.fields || {};
        data.fields.capitol = fakeCheckbox("capitol", true);
        data.fields.capitolRules = fakeCheckbox("capitolRules", true);
        data.fields.capitolOdds = fakeCheckbox("capitolOdds", false);
        data.fields.capitolOddsOdds = fakeInput("capitolOddsOdds");
        data.fields.board0 = {value: ""};
        return data;
    }
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
            capitol.update(data, presentData);
        });
        it("Doesn't add a capitol when map has only one castle", function () {
            let presentData = createBoardList(["Farm"]);
            presentData = capitol.update(data, presentData);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("useCapitol", false);
        });
        it("Adds a capitol to the Oracle board", function () {
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("useCapitol", true);
        });
        it("uses a North direction when random is less than 0.5", function () {
            Math.random = () => 0;
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("direction", "N");
        });
        it("uses a South direction when random is more than 0.5", function () {
            Math.random = () => 0.75;
            let presentData = createBoardList(["Oracle"]);
            presentData = capitol.update(data, presentData);
            const capitolData = presentData.boards[0].capitol;
            expect(capitolData).to.have.property("direction", "S");
        });
        it("Adds a capitol to multiple valid boards", function () {
            let presentData = createBoardList(
                ["Oracle", "Farm", "Harbor", "Paddock"]
            );
            presentData = capitol.update(data, presentData);
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
            presentData = capitol.update(data, presentData);
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
            presentData = capitol.update(data, presentData);
            const boardsList = presentData.boards;
            let capitolData = boardsList[0].capitol;
            expect(capitolData).to.have.property("useCapitol", false);
            capitolData = boardsList[1].capitol;
            expect(capitolData).to.have.property("useCapitol", false);
        });
        it("with high odds, uses the capitol", function () {
            oddsOdds.value = "100";
            let presentData = createBoardList(["Farm", "Oracle"]);
            presentData = capitol.update(data, presentData);
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
