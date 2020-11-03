/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const caves = require("../../src/expansions/caves.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Caves Integration test", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {};
    });
    describe("init", function () {
        it("passes data through the init", function () {
            data = {test: "successful test"};
            data = caves.init(document, data);
            expect(data).to.have.property("test", "successful test");
        });
    });
});
