/*jslint node, es6 */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../src/boards.js");
const view = require("../src/view.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;
const {document} = new JSDOM(docpage).window;

describe("View", function () {
    "use strict";
    let presentData;
    beforeEach(function () {
        presentData = {
            boards: [
                {name: "", type: ""},
                {name: "", type: ""},
                {name: "", type: ""},
                {name: "", type: ""}
            ],
            goals: [
                {name: "", type: ""},
                {name: "", type: ""},
                {name: "", type: ""}
            ],
            tasks: [
                {name: ""},
                {name: ""},
                {name: ""},
                {name: ""}
            ]
        };
    });
    describe("errors", function () {
        it("throws error when presentData is missing", function () {
            presentData = undefined;
            expect(() => view.update(presentData)).to.throw("Missing presentData");
        });
    });
    describe("show", function () {
        it("returns true after updating the view", function () {
            const data = {};
            boards.init(document, data);
            const parts = [boards];
            const viewData = view.update(presentData, parts, data.fields);
            expect(viewData.boards[0].value).to.not.equal(undefined);
        });
        it("shows a board", function () {
            const data = {};
            boards.init(document, data);
            presentData.boards[0].name = "Tavern";
            presentData.boards[0].type = "base";
            const board1 = document.querySelector("#b0");
            board1.value = "";
            board1.setAttribute("class", "");
            const parts = [boards];
            view.update(presentData, parts, data.fields);
            expect(board1.value).to.equal("Tavern");
            expect(board1.getAttribute("class")).to.equal("base");
        });
    });
});
