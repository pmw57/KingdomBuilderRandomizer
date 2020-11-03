/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
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
    describe("update", function () {
        let data;
        let presentData;
        let cacheRandom;
        beforeEach(function () {
            data = {};
            data = players.init(document, data);
            presentData = {};
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("has startingPlayer between 1 and 5", function () {
            document.getElementById("p").value = "5";
            presentData = players.update(data, presentData, document);
            expect(presentData.startingPlayer).to.be.within(1, 5);
        });
        it("one player means only first player is chosen", function () {
            document.getElementById("p").value = "1";
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 1);
        });
        it("uses low random to decide player 1 starts", function () {
            document.getElementById("p").value = "5";
            Math.random = () => 0;
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 1);
        });
        it("uses lowish random to decide player 2 starts", function () {
            document.getElementById("p").value = "5";
            Math.random = () => 0.20;
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 2);
        });
        it("uses middling low random to decide player 3 starts", function () {
            document.getElementById("p").value = "5";
            Math.random = () => 0.4;
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 3);
        });
        it("uses middling high random to decide player 5 starts", function () {
            document.getElementById("p").value = "5";
            Math.random = () => 0.6;
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 4);
        });
        it("uses high random to decide player 5 starts", function () {
            document.getElementById("p").value = "5";
            Math.random = () => 0.8;
            presentData = players.update(data, presentData, document);
            expect(presentData).to.have.property("startingPlayer", 5);
        });
    });
    describe("render", function () {
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
            expect(viewData).to.have.property(
                "startingPlayer",
                "Player 1 starts"
            );
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
            expect(viewData).to.have.property("test", "successful test");
        });
        it("shows the starting player on the screen", function () {
            const viewData = {
                startingPlayer: "Player 1 starts"
            };
            players.view(viewData, data.fields);
            const chosenPlayer = document.getElementById("pc");
            expect(chosenPlayer).to.have.property(
                "textContent",
                "Player 1 starts"
            );
        });
    });
});