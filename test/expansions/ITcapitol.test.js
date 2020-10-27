/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../../src/boards.js");
const capitol = require("../../src/expansions/capitol.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Capitol Integration Tests", function () {
    "use strict";
    let document;
    let cachedRandom;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        cachedRandom = Math.random;
    });
    afterEach(function () {
        Math.random = cachedRandom;
    });
    describe("view", function () {
        it("adds capitol to the board", function () {
            Math.random = () => 0.5;
            let data = {};
            data = boards.init(document, data);
            data = capitol.init(document, data);
            let presentData = {};
            presentData = boards.update(data, presentData, document);
            presentData = capitol.update(data, presentData, document);
            let viewData = {};
            viewData = boards.render(presentData, viewData);
            viewData = capitol.render(presentData, viewData);
            boards.view(viewData, data.fields);
            capitol.view(viewData, data.fields);
            let board = data.fields.board0;
            expect(board).to.have.property("value", "Oracle (Capitol S)");
        });
    });
});
