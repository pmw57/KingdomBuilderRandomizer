/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const cards = require("../src/cards.js");
const boards = require("../src/boards.js");
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
            expect(data.names).to.include("base");
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
            expect(boardsField.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
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
            const badUpdate = () => boards.update(data, presentData, undefined);
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
            data = boards.init(document, data);
            let presentData = {};
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
            expect(typeof boardList[0].flipped).equal("boolean");
            expect(typeof boardList[1].flipped).equal("boolean");
            expect(typeof boardList[2].flipped).equal("boolean");
            expect(typeof boardList[3].flipped).equal("boolean");
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
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("puts together presentation info for the boards", function () {
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
