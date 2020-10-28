/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../../src/boards.js");
const caves = require("../../src/expansions/caves.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Caves Integration", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base", "nomads"],
            miniNames: ["capitol", "caves", "island"],
            mini: {
                caves: ["Tavern"]
            }
        };
    });
    describe("view", function () {
        it("adds cave to a board", function () {
            Math.random = () => 0;
            data = boards.init(document, data);
            data = caves.init(document, data);
            let presentData = {};
            presentData = boards.update(data, presentData, document);
            presentData = caves.update(data, presentData, document);
            let viewData = {};
            viewData = boards.render(presentData, viewData);
            viewData = caves.render(presentData, viewData);
            boards.view(viewData, data.fields);
            caves.view(viewData, data.fields);
            let board3 = data.fields.board3;
            expect(board3).to.have.text("Tavern (Cave)");
        });
    });
});
