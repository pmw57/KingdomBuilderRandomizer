/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../../src/boards.js");
const marshlands = require("../../src/expansions/marshlands.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Marshlands", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base"],
            contents: {
                boards: {
                    "base": ["Board 1", "Board 2"]
                }
            }
        };
    });
    describe("inits", function () {
        // TODO tidy
        function removeEl(selector) {
            const el = document.querySelector(selector);
            el.parentNode.removeChild(el);
        }
        it("adds needed HTML code to the page", function () {
            marshlands.init(document, data);
            removeEl("#marshlands");
            const marshlandsBefore = document.querySelectorAll("#marshlands");
            expect(marshlandsBefore.length).to.equal(0);
            marshlands.init(document, data);
            const marshlandsAfter = document.querySelectorAll("#marshlands");
            expect(marshlandsAfter.length).to.equal(1);
        });
        it("doesn't add HTML code when it already exists", function () {
            marshlands.init(document, data);
            const marshlandsBefore = document.querySelectorAll("#marshlands");
            expect(marshlandsBefore.length).to.equal(1);
            marshlands.init(document, data);
            const marshlandsAfter = document.querySelectorAll("#marshlands");
            expect(marshlandsAfter.length).to.equal(1);
        });
        it("updates data.names", function () {
            expect(data.names.includes("marshlands")).to.equal(false);
            data = marshlands.init(document, data);
            expect(data.names.includes("marshlands")).to.equal(true);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = marshlands.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = marshlands.init(document, data);
            expect(data.fields.marshlands.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        // TODO tidy
        it("passes data to through the update", function () {
            let presentData = {test: "successful test"};
            presentData = marshlands.update(data, presentData);
            expect(presentData.test).to.equal("successful test");
        });
    });
    describe("presenter", function () {
        // TODO tidy
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = marshlands.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
    });
    describe("view", function () {
        // TODO tidy
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = marshlands.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
    });
});