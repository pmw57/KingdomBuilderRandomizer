/*jslint node, es6 */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const expansion = require("../src/expansions/expansion.js");
const cards = require("../src/cards.js");
const boards = require("../src/boards.js");
const nomads = require("../src/expansions/nomads.js");
const presenter = require("../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;
const {document} = new JSDOM(docpage).window;

describe("Boards", function () {
    "use strict";
    let data;
    let shuffleTestStub;
    beforeEach(function () {
        data = {
            names: []
        };
        shuffleTestStub = function (arr) {
            // reverse is more reliably tested than shuffle
            return arr.reverse();
        };
        expansion.init(document, data);
    });
    describe("init", function () {
        // TODO tidy
        it("updates data.names", function () {
            expect(data.names.includes("base")).to.equal(false);
            data = boards.init(document, data);
            expect(data.names.includes("base")).to.equal(true);
        });
        it("adds boards HTML to the page", function () {
            if (document.querySelector(".boards")) {
                document.querySelector(".boards").remove();
            }
            expect(document.querySelectorAll(".boards").length).to.equal(0);
            boards.init(document, data);
            expect(document.querySelectorAll(".boards").length).to.equal(1);
            expect(document.querySelectorAll("#b0").length).to.equal(1);
            expect(document.querySelectorAll("#b1").length).to.equal(1);
            expect(document.querySelectorAll("#b2").length).to.equal(1);
            expect(document.querySelectorAll("#b3").length).to.equal(1);
        });
        it("adds boards only once to the page", function () {
            boards.init(document, data);
            expect(document.querySelectorAll(".boards").length).to.equal(1);
            boards.init(document, data);
            expect(document.querySelectorAll(".boards").length).to.equal(1);
            expect(document.querySelectorAll("#b0").length).to.equal(1);
            expect(document.querySelectorAll("#b1").length).to.equal(1);
            expect(document.querySelectorAll("#b2").length).to.equal(1);
            expect(document.querySelectorAll("#b3").length).to.equal(1);
        });
        it("can init multiple times without ruining the boards reference", function () {
            data = {};
            data = boards.init(document, data);
            data = {};
            data = boards.init(document, data);
            expect(data.fields.boards.parentNode).to.not.equal(undefined);
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
            expect(presentData.boards[3].type).to.equal("base");
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
            expect(boardList.length).to.equal(4);
        });
        it("selects four random different boards", function () {
            // Here, random is replaced with reverse
            cards.shuffle = shuffleTestStub;

            let presentData = {};
            data = boards.init(document, data);
            presentData = boards.update(data, presentData, document);
            const boardList = presentData.boards;
            expect(boardList[0].name).to.equal("Paddock");
            expect(boardList[1].name).to.equal("Harbor");
            expect(boardList[2].name).to.equal("Barn");
            expect(boardList[3].name).to.equal("Tavern");
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
            expect(boardList[0].type).to.equal("base");
            expect(boardList[1].type).to.equal("base");
            expect(boardList[2].type).to.equal("base");
            expect(boardList[3].type).to.equal("base");
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
            expect(presentData.boards[0].name).to.equal("Farm");
            expect(presentData.boards[1].name).to.equal("Oasis");
            expect(presentData.boards[2].name).to.equal("Tower");
            expect(presentData.boards[3].name).to.equal("Tavern");
        });
        it("presents the board type", function () {
            data = {};
            data = boards.init(document, data);
            const parts = [boards];
            const presentData = presenter.update(data, parts, document);
            expect(presentData.boards[0].type).to.equal("base");
        });
        it("presents a flipped board", function () {
            data = {};
            data = boards.init(document, data);
            Math.random = () => 0.99;
            const parts = [boards];
            const presentData = presenter.update(data, parts, document);
            expect(presentData.boards[0].flipped).to.equal(true);
        });
    });
});
