/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
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
        it("adds checkbox to the page", function () {
            data = marshlands.init(document, data);
            const checkbox = document.querySelector("#marshlands");
            expect(checkbox).to.have.tagName("INPUT");
        });
        it("doesn't duplicate HTML code", function () {
            data = marshlands.init(document, data);
            data = marshlands.init(document, data);
            const checkboxes = document.querySelectorAll("#marshlands");
            expect(checkboxes).to.have.lengthOf(1);
        });
        it("updates data.names", function () {
            expect(data.names).to.not.include("marshlands");
            data = marshlands.init(document, data);
            expect(data.names).to.include("marshlands");
        });
    });
    describe("update", function () {
        it("passes data to through the update", function () {
            let presentData = {test: "successful test"};
            presentData = marshlands.update(data, presentData);
            expect(presentData).to.have.property("test", "successful test");
        });
    });
    describe("presenter", function () {
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = marshlands.render(presentData, viewData);
            expect(viewData).to.have.property("test", "successful test");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = marshlands.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
    });
});