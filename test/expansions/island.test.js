/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
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
    describe("init", function () {
        it("adds island HTML to the page", function () {
            data = boards.init(document, data);
            expect(document.querySelector("#i0")).to.equal(null);
            data = island.init(document, data);
            const checkbox = document.querySelector("#i0");
            expect(checkbox).to.have.tagName("OUTPUT");
        });
        it("adds island only once to the page", function () {
            data = boards.init(document, data);
            data = island.init(document, data);
            data = island.init(document, data);
            const islandCheckboxes = document.querySelectorAll("#i0");
            expect(islandCheckboxes).to.have.lengthOf(1);
        });
        it("doesn't ruin island when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = island.init(document, data);
            // innerHTML in second init used to ruin previous references
            data = {};
            data = boards.init(document, data);
            data = island.init(document, data);
            const islandField = data.fields.i0;
            expect(islandField.parentNode).to.not.equal(undefined);
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
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("adds an island property to presentData", function () {
            expect(presentData).to.not.have.property("island");
            presentData = island.update(data, presentData, document);
            expect(presentData).to.have.property("island");
        });
        it("doesn't use island when expansion isn't checked", function () {
            document.querySelector("#island").checked = false;
            presentData = island.update(data, presentData, document);
            expect(presentData.island).to.have.property("useIsland", false);
        });
        it("doesn't use island when boards don't support it", function () {
            presentData = {boards: [{name: "Board 1"}, {name: "Board 2"}]};
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island).to.have.property("useIsland", false);
        });
        it("decides if an island is to be used", function () {
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island).to.have.property("useIsland", true);
        });
        it("chooses unflipped with a low random value", function () {
            document.querySelector(".sidebar");
            Math.random = () => 0.25;
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island).to.have.property("flipped", false);
        });
        it("chooses flipped with a high random value", function () {
            Math.random = () => 0.75;
            data = island.init(document, data);
            presentData = island.update(data, presentData, document);
            expect(presentData.island).to.have.property("flipped", true);
        });
    });
    describe("update when odds are active", function () {
        let presentData;
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
            presentData = {
                boards: [
                    {name: "Board 1"},
                    {name: "Harbor"}
                ]
            };
            data = boards.init(document, data);
            data = island.init(document, data);
            document.querySelector("#islandOdds").checked = true;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        function checkUseIsland(value, random) {
            document.querySelector("#islandOddsOdds").value = value;
            Math.random = () => random;
            presentData = island.update(data, presentData, document);
            return presentData.island.useIsland;
        }
        it("with zero odds, no island is used", function () {
            const useIsland = checkUseIsland("0", 0.5);
            expect(useIsland).to.equal(false);
        });
        it("with full odds, uses island", function () {
            const useIsland = checkUseIsland("100", 0.5);
            expect(useIsland).to.equal(true);
        });
        it("with random low odds, doesn't use island", function () {
            const useIsland = checkUseIsland("25", 0.5);
            expect(useIsland).to.equal(false);
        });
        it("with random high odds, uses island", function () {
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
            expect(viewData).to.have.property("test", "successful test");
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
            expect(viewData.island).to.have.property("value", "");
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
            expect(viewData.island).to.have.property("value", "Island");
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
            expect(viewData.island).to.have.property("value", "Island (↷)");
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
            expect(viewData).to.have.property("test", "successful test");
        });
    });
});