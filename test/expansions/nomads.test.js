/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../../src/boards.js");
const nomads = require("../../src/expansions/nomads.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Nomads", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base"],
            miniNames: ["capitol", "caves", "island"],
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
            expect(document.querySelector("#nomads")).to.equal(null);
            data = nomads.init(document, data);
            const checkbox = document.querySelector("#nomads");
            expect(checkbox.nodeName).to.equal("INPUT");
        });
        it("doesn't add HTML code when it already exists", function () {
            data = nomads.init(document, data);
            data = nomads.init(document, data);
            const checkboxes = document.querySelectorAll("#nomads");
            expect(checkboxes.length).to.equal(1);
        });
        it("updates data.names", function () {
            expect(data.names).to.not.include("nomads");
            data = nomads.init(document, data);
            expect(data.names).to.include("nomads");
        });
        it("adds Nomads boards", function () {
            expect(data.contents.boards.nomads).to.equal(undefined);
            data = nomads.init(document, data);
            expect(data.contents.boards.nomads.length).to.equal(4);
        });
        it("doesn't ruin nomads when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            const nomadsField = data.fields.nomads;
            const parentName = nomadsField.parentNode.constructor.name;
            expect(parentName).to.equal("HTMLLIElement");
        });
    });
    describe("update", function () {
        // TODO tidy
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("passes data to through the update", function () {
            let presentData = {test: "successful test"};
            presentData = nomads.update(data, presentData);
            expect(presentData.test).to.equal("successful test");
        });
    });
    describe("presenter", function () {
        // TODO tidy
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = nomads.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
    });
    describe("view", function () {
        // TODO tidy
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = nomads.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
    });
});