/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const storage = require("../../src/storage.js");
const boards = require("../../src/boards.js");
const nomads = require("../../src/expansions/nomads.js");
const caves = require("../../src/expansions/caves.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Storage", function () {
    "use strict";
    let document;
    let fakeDoc;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        fakeDoc = {
            createElement: (el) => document.createElement(el),
            createTextNode: (text) => document.createTextNode(text),
            querySelector: (selector) => document.querySelector(selector),
            querySelectorAll: (selector) => document.querySelectorAll(selector),
            defaultView: {
                localStorage: {}
            }
        };
    });
    describe("init", function () {
        it("can init", function () {
            expect(
                () => storage.init(document)
            ).to.throw("localStorage is not available");
        });
    });
    describe("set", function () {
        it("can set", function () {
            expect(() => storage.set("testKey")).to.not.throw();
        });
    });
    describe("get", function () {
        it("throws error when key not found", function () {
            storage.set("testKey", "test value");
            const result = storage.get("testKey");
            expect(result).to.equal("test value");
        });
    });
    describe("update", function () {
        it("throws an error when no storage", function () {
            storage.init({defaultView: {}});
            expect(() => storage.update()).to.throw("No storage");
        });
        it("can update checkbox", function () {
            let data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = caves.init(document, data);
            fakeDoc.defaultView.localStorage.nomads = "false";
            storage.init(fakeDoc);
            const checkbox = document.querySelector("#nomads");
            checkbox.setAttribute("checked", "checked");
            expect(checkbox).to.have.property("checked", true);
            storage.update();
            expect(checkbox).to.have.property("checked", false);
        });
        it("can update radio", function () {
            let data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = caves.init(document, data);
            fakeDoc.defaultView.localStorage.cavesRulesVsOdds = "cavesRules";
            storage.init(fakeDoc);
            const radio1 = document.querySelector("#cavesRules");
            const radio2 = document.querySelector("#cavesOdds");
            radio2.click();
            expect(radio1).to.have.property("checked", false);
            expect(radio2).to.have.property("checked", true);
            storage.update();
            expect(radio1).to.have.property("checked", true);
            expect(radio2).to.have.property("checked", false);
        });
    });
    describe("monitor", function () {
        let window;
        beforeEach(function () {
            window = document.defaultView;
        });
        it("can monitor text input", function () {
            let data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = caves.init(document, data);
            storage.init(fakeDoc);
            storage.monitor();
            const textInput = document.querySelector("#cavesOddsOdds");
            const changeEvent = new window.Event("change");
            textInput.dispatchEvent(changeEvent);
        });
        it("can monitor checkbox", function () {
            let data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = caves.init(document, data);
            storage.init(fakeDoc);
            storage.monitor();
            const textInput = document.querySelector("input[type=checkbox]");
            const changeEvent = new window.Event("change");
            textInput.dispatchEvent(changeEvent);
        });
        it("can monitor radio", function () {
            let data = {};
            data = boards.init(document, data);
            data = nomads.init(document, data);
            data = caves.init(document, data);
            storage.init(fakeDoc);
            storage.monitor();
            const textInput = document.querySelector("input[type=radio]");
            const changeEvent = new window.Event("change");
            textInput.dispatchEvent(changeEvent);
        });
    });
});
