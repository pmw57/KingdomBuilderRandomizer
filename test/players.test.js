/*jslint node, es6 */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
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
        it("can init multiple times", function () {
            let data = {};
            data = boards.init(document, data);
            data = players.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = players.init(document, data);
            expect(data.fields.playerCount.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
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
            expect(presentData.startingPlayer).to.equal(1);
        });
        it("with more than one player, uses low random to decide player 1 starts", function () {
            Math.random = () => 0;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData.startingPlayer).to.equal(1);
        });
        it("with more than one player, uses lowish random to decide player 2 starts", function () {
            Math.random = () => 0.25;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData.startingPlayer).to.equal(2);
        });
        it("with more than one player, uses middling random to decide player 3 starts", function () {
            Math.random = () => 0.5;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData.startingPlayer).to.equal(3);
        });
        it("with more than one player, uses high random to decide player 4 starts", function () {
            Math.random = () => 0.75;
            document.getElementById("p").value = "4";
            presentData = players.update(data, presentData, document);
            expect(presentData.startingPlayer).to.equal(4);
        });
    });
    describe("render", function () {
        it("passes through viewData", function () {
            const presentData = {};
            let viewData = {test: "successful test"};
            viewData = players.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
        it("sets the viewData player message", function () {
            const presentData = {
                startingPlayer: 1
            };
            let viewData = {};
            viewData = players.render(presentData, viewData);
            expect(viewData.startingPlayer).to.equal("Player 1 starts");
        });
    });
    describe("view", function () {
        let data;
        beforeEach(function () {
            data = {};
            data = players.init(document, data);
        });
        it("passes through viewData", function () {
            let viewData = {test: "successful test"};
            viewData = players.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
        it("shows the starting player on the screen", function () {
            const viewData = {
                startingPlayer: "Player 1 starts"
            };
            players.view(viewData, data.fields);
            const chosenPlayer = document.getElementById("pc");
            expect(chosenPlayer.textContent).to.equal("Player 1 starts");
        });
    });
});