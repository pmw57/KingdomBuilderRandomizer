/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../../src/boards.js");
const capitol = require("../../src/expansions/capitol.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Capitol UI tests", function () {
    "use strict";
    let document;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
    });
    describe("init", function () {
        let data;
        beforeEach(function () {
            data = {
                contents: {
                    boards: {}
                }
            };
        });
        it("creates a sidebar during init", function () {
            expect(document.querySelector(".sidebar")).to.equal(null);
            data = capitol.init(document, data);
            expect(document.querySelector(".sidebar")).to.have.tagName("DIV");
        });
        it("creates a capitol checkbox", function () {
            expect(document.querySelector("#capitol")).to.equal(null);
            data = capitol.init(document, data);
            const capitolCheckbox = document.querySelector("#capitol");
            expect(capitolCheckbox).to.have.property("checked", true);
        });
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
