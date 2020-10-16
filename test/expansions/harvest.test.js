/*jslint node, es6 */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").expect;
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
        function removeEl(selector) {
            const el = document.querySelector(selector);
            el.parentNode.removeChild(el);
        }
        it("adds needed HTML code to the page", function () {
            harvest.init(document, data);
            removeEl("#harvest");
            const harvestBefore = document.querySelectorAll("#harvest");
            expect(harvestBefore.length).to.equal(0);
            harvest.init(document, data);
            const harvestAfter = document.querySelectorAll("#harvest");
            expect(harvestAfter.length).to.equal(1);
        });
        it("doesn't add HTML code when it already exists", function () {
            harvest.init(document, data);
            const harvestBefore = document.querySelectorAll("#harvest");
            expect(harvestBefore.length).to.equal(1);
            harvest.init(document, data);
            const harvestAfter = document.querySelectorAll("#harvest");
            expect(harvestAfter.length).to.equal(1);
        });
        it("updates data.names", function () {
            expect(data.names.includes("harvest")).to.equal(false);
            data = harvest.init(document, data);
            expect(data.names.includes("harvest")).to.equal(true);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = harvest.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = harvest.init(document, data);
            expect(data.fields.harvest.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        it("passes data to through the update", function () {
            let presentData = {test: "successful test"};
            presentData = harvest.update(data, presentData);
            expect(presentData.test).to.equal("successful test");
        });
    });
    describe("presenter", function () {
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = harvest.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = harvest.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
    });
});