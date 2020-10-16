/*jslint node, es6 */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../../src/boards.js");
const island = require("../../src/expansions/island.js");
const presenter = require("../../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Island", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base", "nomads"],
            miniNames: ["island"],
            contents: {
                boards: {
                    "base": ["Board 1", "Harbor"],
                    "nomads": ["Board 3", "Board 4"]
                },
                goals: {
                    "base": ["Goal 1", "Goal 2"],
                    "nomads": ["Goal 3", "Goal 4"]
                }
            },
            mini: {}
        };
    });
    describe("errors", function () {
        it("throws an error when the boards section is missing", function () {
            data = {};
            const viewFn = () => island.init(document, data);
            expect(viewFn).to.throw("Missing boards section");
        });
    });
    describe("init", function () {
        it("adds island HTML to the page", function () {
            if (document.querySelector("#i0")) {
                document.querySelector("#i0").remove();
            }
            expect(document.querySelectorAll("#i0").length).to.equal(0);
            boards.init(document, data);
            island.init(document, data);
            expect(document.querySelectorAll("#i0").length).to.equal(1);
        });
        it("adds island only once to the page", function () {
            boards.init(document, data);
            island.init(document, data);
            expect(document.querySelectorAll("#i0").length).to.equal(1);
            island.init(document, data);
            expect(document.querySelectorAll("#i0").length).to.equal(1);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = island.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = island.init(document, data);
            expect(data.fields.island.parentNode).to.not.equal(undefined);
            expect(data.fields.i0.parentNode).to.not.equal(undefined);
        });
    });
    describe("is water board", function () {
        it("checks if board has water-based actions", function () {
            data = boards.init(document, data);
            data = island.init(document, data);
            const isWaterBoard = island.isWaterBoard("Harbor", data);
            expect(isWaterBoard).to.equal(true);
        });
    });
    describe("update when rules are active", function () {
        let presentData;
        let cacheRandom;
        beforeEach(function () {
            presentData = {
                boards: [
                    {name: "Board 1"},
                    {name: "Harbor"}
                ]
            };
            cacheRandom = Math.random;
            data = boards.init(document, data);
            data = island.init(document, data);
            document.querySelector("#island").checked = true;
            document.querySelector("#islandRules").checked = true;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("adds an island property to presentData", function () {
            if (presentData.island) {
                delete presentData.island;
            }
            expect(presentData.island).to.equal(undefined);
            presentData = island.update(data, presentData, document);
            expect(presentData.island).to.not.equal(undefined);
            expect(presentData.island).to.be.an("object");
        });
        it("doesn't use island when expansion isn't checked", function () {
            document.querySelector("#island").checked = false;
            presentData = island.update(data, presentData, document);
            expect(presentData.island.useIsland).to.equal(false);
        });
        it("doesn't use island when boards don't support it", function () {
            presentData = {boards: [{name: "Board 1"}, {name: "Board 2"}]};
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island.useIsland).to.equal(false);
        });
        it("decides if an island is to be used", function () {
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island.useIsland).to.equal(true);
        });
        it("chooses flipped with a high random value", function () {
            Math.random = () => 0.75;
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island.flipped).to.equal(true);
        });
        it("chooses unflipped with a low random value", function () {
            document.querySelector(".sidebar");
            Math.random = () => 0.25;
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island.flipped).to.equal(false);
        });
    });
    function resetIsland() {
        if (document.querySelector("#island")) {
            const islandListItem = document.querySelector("#island").parentNode;
            islandListItem.parentNode.removeChild(islandListItem);
        }
    }
    describe("update when odds are active", function () {
        let presentData;
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
            resetIsland();
            presentData = {
                boards: [
                    {name: "Board 1"},
                    {name: "Harbor"}
                ]
            };
            data = boards.init(document, data);
            data = island.init(document, data);
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        function checkUseIsland(value, random) {
            document.querySelector("#islandOdds").checked = true;
            document.querySelector("#islandOddsOdds").value = value;
            Math.random = () => random;
            presentData = island.update(data, presentData, document);
            return presentData.island.useIsland;
        }
        it("with zero odds, no island is used", function () {
            document.querySelector("#islandOdds").checked = true;
            const useIsland = checkUseIsland("0", 0.5);
            expect(useIsland).to.equal(false);
        });
        it("with full odds, uses island", function () {
            document.querySelector("#islandOdds").checked = true;
            const useIsland = checkUseIsland("100", 0.5);
            expect(useIsland).to.equal(true);
        });
        it("with random low odds, doesn't use island", function () {
            document.querySelector("#islandOdds").checked = true;
            const useIsland = checkUseIsland("25", 0.5);
            expect(useIsland).to.equal(false);
        });
        it("with random high odds, uses island", function () {
            document.querySelector("#islandOdds").checked = true;
            const useIsland = checkUseIsland("75", 0.5);
            expect(useIsland).to.equal(true);
        });
    });
    describe("island presenter", function () {
        let islandUpdate;
        beforeEach(function () {
            islandUpdate = island.update;
            presenter.init();
        });
        afterEach(function () {
            island.update = islandUpdate;
        });
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = island.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
        it("empties the island field", function () {
            data = {};
            const presentData = {
                island: {
                    useIsland: false
                }
            };
            let viewData = {};
            viewData = island.render(presentData, viewData);
            expect(viewData.island.value).to.equal("");
        });
        it("shows the island", function () {
            const presentData = {
                island: {
                    useIsland: true,
                    flipped: false
                }
            };
            data = {};
            let viewData = {};
            viewData = island.render(presentData, viewData);
            expect(viewData.island.value).to.equal("Island");
        });
        it("shows a flipped island", function () {
            const presentData = {
                island: {
                    useIsland: true,
                    flipped: true
                }
            };
            data = {};
            let viewData = {};
            viewData = island.render(presentData, viewData);
            expect(viewData.island.value).to.equal("Island (↷)");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            boards.init(document, data);
            island.init(document, data);
            let viewData = {
                island: {},
                test: "successful test"
            };
            viewData = island.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
    });
});