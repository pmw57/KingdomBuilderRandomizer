/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../src/boards.js");
const players = require("../src/players.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;

describe("Players", function () {
    "use strict";
    let document;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
    });
    describe("init", function () {
        it("doesn't ruin playerCount when init'd multiple times", function () {
            let data = {};
            data = boards.init(document, data);
            data = players.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = players.init(document, data);
            const playerField = data.fields.playerCount;
            const parentName = playerField.parentNode.constructor.name;
            expect(parentName).to.equal("HTMLParagraphElement");
        });
    });
    describe("update", function () {
        // TODO tidy
        let data;
        let presentData;
        let cacheRandom;
        beforeEach(function () {
            data = {};
            data = players.init(document, data);
            presentData = {};
            data = players.init(document, data);
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("has startingPlayer between 1 and 5", function () {
            presentData = players.update(data, presentData, document);
            expect(presentData.startingPlayer).to.be.within(1, 5);
        });
        it("one player means only first player is chosen", function () {
            document.getElementById("p").value = "1";
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 1);
        });
        it("uses low random to decide player 1 starts", function () {
            Math.random = () => 0;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 1);
        });
        it("uses lowish random to decide player 2 starts", function () {
            Math.random = () => 0.25;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 2);
        });
        it("uses middling random to decide player 3 starts", function () {
            Math.random = () => 0.5;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 3);
        });
        it("uses high random to decide player 4 starts", function () {
            Math.random = () => 0.75;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 4);
        });
    });
    describe("render", function () {
        // TODO tidy
        it("passes through viewData", function () {
            const presentData = {};
            let viewData = {test: "successful test"};
            viewData = players.render(presentData, viewData);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("sets the viewData player message", function () {
            const presentData = {
                startingPlayer: 1
            };
            let viewData = {};
            viewData = players.render(presentData, viewData);
            expect(viewData).to.have.property("startingPlayer", "Player 1 starts");
        });
    });
    describe("view", function () {
        // TODO tidy
        let data;
        beforeEach(function () {
            data = {};
            data = players.init(document, data);
        });
        it("passes through viewData", function () {
            let viewData = {test: "successful test"};
            viewData = players.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("shows the starting player on the screen", function () {
            const viewData = {
                startingPlayer: "Player 1 starts"
            };
            players.view(viewData, data.fields);
            const chosenPlayer = document.getElementById("pc");
            expect(chosenPlayer).to.have.property("textContent", "Player 1 starts");
        });
    });
});