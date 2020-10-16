/*jslint node, es6 */
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
            nomads.init(document, data);
            removeEl("#nomads");
            const nomadsBefore = document.querySelectorAll("#nomads");
            expect(nomadsBefore.length).to.equal(0);
            nomads.init(document, data);
            const nomadsAfter = document.querySelectorAll("#nomads");
            expect(nomadsAfter.length).to.equal(1);
        });
        it("doesn't add HTML code when it already exists", function () {
            nomads.init(document, data);
            const nomadsBefore = document.querySelectorAll("#nomads");
            expect(nomadsBefore.length).to.equal(1);
            nomads.init(document, data);
            const nomadsAfter = document.querySelectorAll("#nomads");
            expect(nomadsAfter.length).to.equal(1);
        });
        it("updates data.names", function () {
            expect(data.names.includes("nomads")).to.equal(false);
            data = nomads.init(document, data);
            expect(data.names.includes("nomads")).to.equal(true);
        });
        it("adds Nomads boards", function () {
            data = nomads.init(document, data);
            expect(data.contents.boards.nomads.length).to.equal(4);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            expect(data.fields.nomads.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
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
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = nomads.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = nomads.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
    });
});