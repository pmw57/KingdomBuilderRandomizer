/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const caves = require("../../src/expansions/caves.js");

describe("Caves", function () {
    "use strict";
    let data;
    beforeEach(function () {
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
    describe("update", function () {
        afterEach(function () {
            data.fields.cavesOddsOdds.value = "50";
        });
        it("doesn't use caves when no Tavern", function () {
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
            let presentData = {
                boards: [
                    {name: "Tavern"}
                ]
            };
            presentData = caves.update(data, presentData);
            expect(presentData.boards[0]).to.have.property("cave", true);
        });
        it("the Oasis board doesn't have caves", function () {
            let presentData = {
                boards: [
                    {name: "Tavern"},
                    {name: "Oasis"}
                ]
            };
            presentData = caves.update(data, presentData);
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
