/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../../src/boards.js");
const harvest = require("../../src/expansions/harvest.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Harvest", function () {
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
        it("adds needed HTML code to the page", function () {
            data = harvest.init(document, data);
            const checkbox = document.querySelector("#harvest");
            expect(checkbox).to.have.tagName("INPUT");
        });
        it("doesn't add HTML code when it already exists", function () {
            data = harvest.init(document, data);
            data = harvest.init(document, data);
            const checkboxes = document.querySelectorAll("#harvest");
            expect(checkboxes).to.have.lengthOf(1);
        });
        it("updates data.names", function () {
            expect(data.names).to.not.include("harvest");
            data = harvest.init(document, data);
            expect(data.names).to.include("harvest");
        });
        it("doesn't ruin harvest when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = harvest.init(document, data);
            // innerHTML in second init used to ruin previous references
            data = {};
            data = boards.init(document, data);
            data = harvest.init(document, data);
            const harvestField = data.fields.harvest;
            expect(harvestField.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        it("passes data to through the update", function () {
            let presentData = {test: "successful test"};
            presentData = harvest.update(data, presentData);
            expect(presentData).to.have.property("test", "successful test");
        });
    });
    describe("presenter", function () {
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = harvest.render(presentData, viewData);
            expect(viewData).to.have.property("test", "successful test");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = harvest.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
    });
});