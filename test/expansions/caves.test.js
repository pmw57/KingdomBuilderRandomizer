/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../../src/boards.js");
const expansion = require("../../src/expansions/expansion.js");
const caves = require("../../src/expansions/caves.js");
const presenter = require("../../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Caves", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base", "nomads"],
            miniNames: ["capitol", "caves", "island"],
            mini: {
                caves: ["Tavern"]
            }
        };
    });
    describe("errors", function () {
        it("informs you when the boards section is missing", function () {
            data = boards.init(document, data);
            document.querySelector(".boards").remove();
            const viewData = {};
            expect(
                () => caves.view(viewData, data.fields)
            ).to.throw("Missing boards section");
        });
    });
    describe("init", function () {
        it("passes data through the init", function () {
            data = {test: "successful test"};
            data = boards.init(document, data);
            data = caves.init(document, data);
            expect(data).to.have.property("test", "successful test");
        });
        it("creates a sidebar during init", function () {
            data = boards.init(document, data);
            expect(document.querySelector(".sidebar")).to.equal(null);
            data = caves.init(document, data);
            const sidebar = document.querySelector(".sidebar");
            expect(sidebar).to.have.tagName("DIV");
        });
        it("adds caves to mini property", function () {
            data = {};
            data = caves.init(document, data);
            expect(data.mini).to.have.property("caves");
        });
        it("defaults to rules", function () {
            data = caves.init(document, data);
            const cavesRules = document.querySelector("#cavesRules");
            const cavesOdds = document.querySelector("#cavesOdds");
            expect(cavesRules).to.have.property("checked", true);
            expect(cavesOdds).to.have.property("checked", false);
        });
        it("has valid caves field after multiple inits", function () {
            data = {};
            data = boards.init(document, data);
            data = caves.init(document, data);
            // innerHTML in second init used to ruin previous references
            data = {};
            data = boards.init(document, data);
            data = caves.init(document, data);
            expect(data.fields.caves.parentNode).to.have.tagName("LI");
        });
    });
    describe("update", function () {
        // TODO tidy
        let cacheGetMinis;
        beforeEach(function () {
            cacheGetMinis = expansion.getMinis;
        });
        afterEach(function () {
            document.getElementById("cavesOddsOdds").value = "50";
            expansion.getMinis = cacheGetMinis;
        });
        it("doesn't use caves when no Tavern", function () {
            expansion.getMinis = function () {
                return {caves: "rules"};
            };
            data = caves.init(document, data);
            let presentData = {
                boards: [
                    {name: "Farm"}
                ]
            };
            presentData = caves.update(data, presentData);
            expect(presentData.boards[0]).to.have.property("name");
            expect(presentData.boards[0]).to.not.have.property("cave");
        });
        it("uses caves with the Tavern", function () {
            expansion.getMinis = function () {
                return {caves: "rules"};
            };
            data = caves.init(document, data);
            let presentData = {
                boards: [
                    {name: "Tavern"}
                ]
            };
            presentData = caves.update(data, presentData);
            expect(presentData.boards[0]).to.have.property("cave", true);
        });
        it("the Oasis board doesn't have caves", function () {
            expansion.getMinis = function () {
                return {caves: "rules"};
            };
            data = caves.init(document, data);
            let presentData = {
                boards: [
                    {name: "Tavern"},
                    {name: "Oasis"}
                ]
            };
            presentData = caves.update(data, presentData, document);
            expect(presentData.boards[0]).to.have.property("cave", true);
            expect(presentData.boards[1]).to.have.property("cave", false);
        });
    });
    describe("presenter", function () {
        // TODO tidy
        let cavesUpdate;
        beforeEach(function () {
            cavesUpdate = caves.update;
        });
        afterEach(function () {
            caves.update = cavesUpdate;
        });
        it("shows a cave", function () {
            caves.update = function () {
                return {
                    boards: [
                        {name: "cavestest", cave: true}
                    ]
                };
            };
            data = {};
            const parts = [caves];
            const presentData = presenter.update(data, parts);
            expect(presentData.boards[0]).to.have.property("name", "cavestest");
            expect(presentData.boards[0]).to.have.property("cave", true);
        });
    });
    describe("render", function () {
        // TODO tidy
        it("passes viewData through without changes", function () {
            const presentData = {
                boards: [],
                test: "Should not be seen"
            };
            let viewData = {
                boards: [],
                test: "successful test"
            };
            viewData = caves.render(presentData, viewData);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("doesn't render a cave when it's not there", function () {
            let presentData = {
                boards: [
                    {name: "presentvalue", cave: false}
                ]
            };
            let viewData = {
                boards: [
                    {value: "viewvalue"}
                ]
            };
            viewData = caves.render(presentData, viewData);
            expect(viewData.boards[0]).to.have.property("value", "viewvalue");
        });
        it("renders a cave", function () {
            let presentData = {
                boards: [
                    {name: "presentvalue", cave: true}
                ]
            };
            let viewData = {
                boards: [
                    {value: "viewvalue"}
                ]
            };
            viewData = caves.render(presentData, viewData);
            expect(viewData.boards[0]).to.have.property("cave", " (Cave)");
        });
    });
    describe("view", function () {
        // TODO tidy
        it("needs a boards section", function () {
            boards.init(document, data);
            document.querySelector(".boards").remove();
            const viewData = {};
            expect(
                () => caves.view(viewData, data.fields)
            ).to.throw("Missing boards section");
        });
        it("passes viewData through the view method", function () {
            boards.init(document, data);
            let viewData = {
                boards: [],
                test: "successful test"
            };
            viewData = caves.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("adds cave to a board", function () {
            data = boards.init(document, data);
            data = caves.init(document, data);
            let viewData = {
                boards: [{value: "test board", cave: " (cave)"}],
                test: "successful test"
            };
            viewData = caves.view(viewData, data.fields);
            const board0 = document.querySelector("#b0");
            expect(board0).to.have.property("value", "test board (cave)");
        });
    });
});
