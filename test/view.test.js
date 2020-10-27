/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../src/boards.js");
const view = require("../src/view.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;

describe("View", function () {
    "use strict";
    let document;
    let presentData;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
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
    // TODO tidy
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
            expect(board1).to.have.property("value", "Tavern");
            expect(board1.getAttribute("class")).to.equal("base");
        });
    });
});
