/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const caves = require("../../src/expansions/caves.js");
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
            },
            fields: {
                cavesOddsOdds: {}
            }
        };
    });
    describe("init", function () {
        it("passes data through the init", function () {
            data = {test: "successful test"};
            data = caves.init(document, data);
            expect(data).to.have.property("test", "successful test");
        });
        it("creates a sidebar during init", function () {
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
    });
    describe("update", function () {
        afterEach(function () {
            data.fields.cavesOddsOdds.value = "50";
        });
        it("doesn't use caves when no Tavern", function () {
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
    describe("render", function () {
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
        it("passes viewData through the view method", function () {
            let viewData = {
                boards: [],
                test: "successful test"
            };
            viewData = caves.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("adds cave to a board", function () {
            data.fields = {
                board0: {},
                board1: {},
                board2: {},
                board3: {}
            };
            data = caves.init(document, data);
            let viewData = {
                boards: [{value: "test board", cave: " (cave)"}],
                test: "successful test"
            };
            viewData = caves.view(viewData, data.fields);
            const board0 = data.fields.board0;
            expect(board0).to.have.property("value", "test board (cave)");
        });
    });
});
