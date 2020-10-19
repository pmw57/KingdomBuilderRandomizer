/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
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
    describe("init", function () {
        // TODO tidy
        it("informs you when the boards section is missing", function () {
            if (document.querySelector(".boards")) {
                document.querySelector(".boards").remove();
            }
            const viewData = {};
            expect(
                () => caves.view(viewData, data.fields)
            ).to.throw("Missing boards section");
        });
        it("has no other view effect", function () {
            data = {};
            data = boards.init(document, data);
            expect(() => caves.init(document, data)).to.not.throw();
        });
        it("creates a sidebar during init", function () {
            expect(document.querySelector(".sidebar")).to.equal(null);
            boards.init(document, data);
            expect(() => caves.init(document, data)).to.not.throw();
            expect(document.querySelector(".sidebar").nodeType).to.equal(1);
        });
        it("can initializes when mini property isn't present", function () {
            data = {};
            caves.init(document, data);
        });
        it("can initializes when mini property is present", function () {
            data.mini = {};
            expansion.init(document, data);
            expect(() => caves.init(document, data)).to.not.throw();
        });
        it("defaults to rules", function () {
            caves.init(document, data);
            const cavesRules = document.querySelector("#cavesRules");
            const cavesOdds = document.querySelector("#cavesOdds");
            expect(cavesRules.checked).to.equal(true);
            expect(cavesOdds.checked).to.equal(false);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = caves.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = caves.init(document, data);
            expect(data.fields.caves.parentNode).to.not.equal(undefined);
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
            expect(presentData.boards[0].cave).to.equal(undefined);
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
            expect(presentData.boards[0].cave).to.equal(true);
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
            expect(presentData.boards[0].cave).to.equal(true);
            expect(presentData.boards[1].cave).to.equal(false);
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
            expect(presentData.boards[0].name).to.equal("cavestest");
            expect(presentData.boards[0].cave).to.equal(true);
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
            expect(viewData.test).to.equal("successful test");
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
            expect(viewData.boards[0].value).to.equal("viewvalue");
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
            expect(viewData.boards[0].cave).to.equal(" (Cave)");
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
            expect(viewData.test).to.equal("successful test");
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
            expect(board0.value).to.equal("test board (cave)");
        });
    });
});
