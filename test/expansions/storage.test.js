/*jslint node, es6 */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").expect;
const storage = require("../../src/storage.js");
const boards = require("../../src/boards.js");
const nomads = require("../../src/expansions/nomads.js");
const caves = require("../../src/expansions/caves.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;
const window = new JSDOM(docpage).window;

describe("Storage", function () {
    "use strict";
    let fakeDoc;
    let document;
    beforeEach(function () {
        document = window.document;
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
            expect(() => storage.init(document)).to.throw("localStorage is not available");
        });
    });
    describe("get", function () {
        it("can get", function () {
            expect(() => storage.get("testKey")).to.throw();
        });
    });
    describe("set", function () {
        it("can set", function () {
            expect(() => storage.set("testKey")).to.throw();
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
            expect(checkbox.checked).to.equal(true);
            storage.update();
            expect(checkbox.checked).to.equal(false);
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
            expect(radio1.checked).to.equal(false);
            expect(radio2.checked).to.equal(true);
            storage.update();
            expect(radio1.checked).to.equal(true);
            expect(radio2.checked).to.equal(false);
        });
    });
    describe("monitor", function () {
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
