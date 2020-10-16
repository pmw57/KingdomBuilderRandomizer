/*jslint node, es6 */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").expect;
const randomKB = require("../src/randomKB.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;
const {document} = new JSDOM(docpage).window;

describe("Random KB", function () {
    "use strict";
    beforeEach(function () {
        delete document.defaultView.localStorage;
    });
    describe("config handler", function () {
        it("ignores a config key with no handler", function () {
            const config = {shouldntMatch: "no match"};
            expect(
                () => randomKB.init(config, document)
            ).to.not.throw();
        });
    });
    it("can initialize", function () {
        const config = {};
        expect(
            () => randomKB.init(config, document)
        ).to.not.throw();
    });
    it("loads an expansion", function () {
        const config = {expansions: ["nomads"]};
        expect(
            () => randomKB.init(config, document)
        ).to.not.throw();
    });
    it("uses local storage", function () {
        const config = {};
        const fakeDoc = {
            createElement: (el) => document.createElement(el),
            createTextNode: (text) => document.createTextNode(text),
            querySelector: (selector) => document.querySelector(selector),
            querySelectorAll: (selector) => document.querySelectorAll(selector),
            defaultView: {
                localStorage: {}
            }
        };
        expect(
            () => randomKB.init(config, fakeDoc)
        ).to.not.throw();
    });
});