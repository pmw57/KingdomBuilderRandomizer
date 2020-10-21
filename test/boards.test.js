/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const expansion = require("../src/expansions/expansion.js");
const cards = require("../src/cards.js");
const boards = require("../src/boards.js");
const nomads = require("../src/expansions/nomads.js");
const presenter = require("../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;

describe("Boards", function () {
    "use strict";
    let document;
    let data;
    let shuffleTestStub;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {};
        shuffleTestStub = function (arr) {
            // reverse is more reliably tested than shuffle
            return arr.reverse();
        };
    });
    describe("init", function () {
        it("updates data.names", function () {
            expect(data).to.not.have.property("names");
            data = boards.init(document, data);
            expect(data.names).includes("base");
        });
        it("adds boards HTML to the page", function () {
            expect(document.querySelector(".boards")).to.equal(null);
            data = boards.init(document, data);
            expect(document.querySelector(".boards")).to.have.tagName("DIV");
            expect(document.querySelector("#b0")).to.have.tagName("OUTPUT");
            expect(document.querySelector("#b1")).to.have.tagName("OUTPUT");
            expect(document.querySelector("#b2")).to.have.tagName("OUTPUT");
            expect(document.querySelector("#b3")).to.have.tagName("OUTPUT");
        });
        it("adds boards only once to the page", function () {
            data = boards.init(document, data);
            data = boards.init(document, data);
            expect(document.querySelectorAll(".boards")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#b0")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#b1")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#b2")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#b3")).to.have.lengthOf(1);
        });
        it("doesn't ruin boards when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = {};
            data = boards.init(document, data);
            const boardsField = data.fields.boards;
            const parentName = boardsField.parentNode.constructor.name;
            expect(parentName).to.equal("HTMLDivElement");
        });
    });
    describe("expansion combinations", function () {
        // TODO tidy
        beforeEach(function () {
            data = boards.init(document, data);
            data = nomads.init(document, data);
        });
        it("defaults to base when no others are selected", function () {
            document.querySelector("#base").checked = false;
            document.querySelector("#nomads").checked = false;
            let presentData = {};
            presentData = boards.update(data, presentData, document);
            expect(presentData.boards[3]).to.have.property("type", "base");
        });
        it("is base when base is selected", function () {
            document.querySelector("#base").checked = true;
            document.querySelector("#nomads").checked = false;
            let presentData = {};
            presentData = boards.update(data, presentData, document);
            const initialTypes = presentData.boards.reduce(function (initialTypes, {type}) {
                return initialTypes + type.substr(0, 1);
            }, "");
            expect(initialTypes).to.equal("bbbb");
        });
        it("nomads when nomads is selected", function () {
            document.querySelector("#base").checked = false;
            document.querySelector("#nomads").checked = true;
            let presentData = {};
            presentData = boards.update(data, presentData, document);
            const initialTypes = presentData.boards.reduce(function (initialTypes, {type}) {
                return initialTypes + type.substr(0, 1);
            }, "");
            expect(initialTypes).to.equal("nnnn");
        });
        it("is base and nomads when both are selected", function () {
            document.querySelector("#base").checked = true;
            document.querySelector("#nomads").checked = true;
            let presentData = {};
            presentData = boards.update(data, presentData, document);
            presentData = nomads.update(data, presentData, document);
            const initialTypes = presentData.boards.reduce(function (initialTypes, {type}) {
                return initialTypes + type.substr(0, 1);
            }, "");
            expect(initialTypes).to.match(/^[bn]{4}$/);
        });
    });
    describe("update", function () {
        // TODO tidy
        let cachedShuffle;
        beforeEach(function () {
            cachedShuffle = cards.shuffle;
        });
        afterEach(function () {
            cards.shuffle = cachedShuffle;
        });
        it("warns you when document is missing", function () {
            data = boards.init(document, data);
            data.contents.boards.nomads = [];
            let presentData = {};
            const badUpdate = () => boards.update(data, presentData);
            expect(badUpdate).to.throw("Missing document");
        });
        it("selects four boards", function () {
            let presentData = {};
            data = boards.init(document, data);
            presentData = boards.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList).to.have.lengthOf(4);
        });
        it("selects four random different boards", function () {
            // Here, random is replaced with reverse
            cards.shuffle = shuffleTestStub;

            let presentData = {};
            data = boards.init(document, data);
            presentData = boards.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0]).to.have.property("name", "Paddock");
            expect(boardList[1]).to.have.property("name", "Harbor");
            expect(boardList[2]).to.have.property("name", "Barn");
            expect(boardList[3]).to.have.property("name", "Tavern");
        });
        it("randomly flips the boards", function () {
            let presentData = {};
            data = boards.init(document, data);
            presentData = boards.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0].flipped).not.equal(undefined);
            expect(boardList[1].flipped).not.equal(undefined);
            expect(boardList[2].flipped).not.equal(undefined);
            expect(boardList[3].flipped).not.equal(undefined);
        });
        it("has the board type", function () {
            let presentData = {};
            data = boards.init(document, data);
            presentData = boards.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0]).to.have.property("type", "base");
            expect(boardList[1]).to.have.property("type", "base");
            expect(boardList[2]).to.have.property("type", "base");
            expect(boardList[3]).to.have.property("type", "base");
        });
    });
    describe("boards presenter", function () {
        // TODO tidy
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("puts together presentation information for the boards", function () {
            data = {};
            data = boards.init(document, data);
            Math.random = () => 0;
            const parts = [boards];
            const presentData = presenter.update(data, parts, document);
            expect(presentData.boards[0]).to.have.property("name", "Farm");
            expect(presentData.boards[1]).to.have.property("name", "Oasis");
            expect(presentData.boards[2]).to.have.property("name", "Tower");
            expect(presentData.boards[3]).to.have.property("name", "Tavern");
        });
        it("presents the board type", function () {
            data = {};
            data = boards.init(document, data);
            const parts = [boards];
            const presentData = presenter.update(data, parts, document);
            expect(presentData.boards[0]).to.have.property("type", "base");
        });
        it("presents a flipped board", function () {
            data = {};
            data = boards.init(document, data);
            Math.random = () => 0.99;
            const parts = [boards];
            const presentData = presenter.update(data, parts, document);
            expect(presentData.boards[0]).to.have.property("flipped", true);
        });
    });
});
