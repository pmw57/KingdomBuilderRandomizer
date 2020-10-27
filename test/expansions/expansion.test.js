/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const boards = require("../../src/boards.js");
const goals = require("../../src/goals.js");
const expansion = require("../../src/expansions/expansion.js");
const nomads = require("../../src/expansions/nomads.js");
const capitol = require("../../src/expansions/capitol.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Expansion", function () {
    "use strict";
    let document;
    let data;

    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base", "nomads"],
            miniNames: ["capitol"],
            contents: {
                boards: {
                    base: [
                        "Board 1",
                        "Board 2",
                        "Board 3",
                        "Board 4",
                        "Board 5",
                        "Board 6"
                    ]
                }
            },
            mini: {
                capitol: {}
            }
        };
    });
    describe("register", function () {
        it("can register an expansion", function () {
            const list = expansion.registerExpansions(["nomads"]);
            expect(list[0].init).to.have.property("name", "initNomads");
        });
    });
    describe("init", function () {
        beforeEach(function () {
            document = new JSDOM(docpage).window.document;
        });
        it("adds sidebar section", function () {
            expect(document.querySelector(".sidebar")).to.equal(null);
            data = expansion.init(document, data);
            expect(document.querySelector(".sidebar")).to.not.equal(null);
            const sidebar = document.querySelector(".sidebar");
            expect(sidebar).to.have.tagName("DIV");
        });
        it("adds expansions section", function () {
            expect(document.querySelector(".expansions")).to.equal(null);
            data = expansion.init(document, data);
            const expansions = document.querySelector(".expansions");
            expect(expansions).to.have.tagName("DIV");
        });
        it("adds base", function () {
            expect(document.querySelector("#base")).to.equal(null);
            data = expansion.init(document, data);
            const base = document.querySelector("#base");
            expect(base).to.have.tagName("INPUT");
        });
        it("uses base goals even when base boards are deselected", function () {
            data = boards.init(document, data);
            data = goals.init(document, data);
            data = expansion.init(document, data);
            let presentData = {};
            document.querySelector("#base").removeAttribute("checked");
            presentData = goals.update(data, presentData, document);
            expect(presentData.goals).to.have.lengthOf(3);
        });
        it("doesn't ruin base when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = expansion.init(document, data);
            // innerHTML in second init used to ruin previous references
            data = {};
            data = boards.init(document, data);
            data = expansion.init(document, data);
            const baseField = data.fields.base;
            expect(baseField.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        it("passes through playerData", function () {
            let presentData = {test: "successful"};
            presentData = expansion.update(presentData);
            expect(presentData).to.have.property("test", "successful");
        });
    });
    describe("finds an expansion", function () {
        it("finds a base board", function () {
            expansion.init(document, data);
            const expansionName = expansion.findExpansion(
                "Board 1",
                data.contents.boards,
                data,
                document
            );
            expect(expansionName).to.equal("base");
        });
    });
    describe("gets the active expansions", function () {
        beforeEach(function () {
            boards.init(document, data);
            nomads.init(document, data);
            capitol.init(document, data);
        });
        it("with no expansions ticked, defaults to only the base", function () {
            document.querySelector("#base").checked = false;
            document.querySelector("#nomads").checked = false;
            const activeExpansions = expansion.getActive(data, document);
            expect(activeExpansions).to.eql(["base"]);
        });
        it("with one expansion ticked, gives that expansion", function () {
            document.querySelector("#base").checked = false;
            document.querySelector("#nomads").checked = true;
            const activeExpansions = expansion.getActive(data, document);
            expect(activeExpansions).to.eql(["nomads"]);
        });
        it("with all expansions ticked, gives all the expansions", function () {
            document.querySelector("#base").checked = true;
            document.querySelector("#nomads").checked = true;
            const activeExpansions = expansion.getActive(data, document);
            expect(activeExpansions).to.eql(["base", "nomads"]);
        });
    });
    describe("mini expansions", function () {
        beforeEach(function () {
            boards.init(document, data);
            capitol.init(document, data);
        });
        it("can init even with no mini property", function () {
            data = {names: []};
            expect(() => expansion.init(document, data)).to.not.throw();
        });
        it("can get an empty set of mini expansions", function () {
            document.querySelector("#capitol").checked = false;
            const miniExpansions = expansion.getMinis(data, document);
            expect(miniExpansions).to.eql({});
        });
        it("gets mini expansions rules", function () {
            document.querySelector("#capitol").checked = true;
            document.querySelector("#capitolRules").checked = true;
            const miniExpansions = expansion.getMinis(data, document);
            expect(miniExpansions).to.eql({
                "capitol": "rules"
            });
        });
        it("gets mini expansions odds", function () {
            document.querySelector("#capitol").checked = true;
            document.querySelector("#capitolOdds").checked = true;
            const miniExpansions = expansion.getMinis(data, document);
            expect(miniExpansions).to.eql({
                "capitol": "odds"
            });
        });
    });
    describe("adds a mini expansion", function () {
        const fakeMini = {
            name: "Fake mini",
            id: "fakemini",
            link: "",
            usageLink: "",
            boards: ["Board 1"]
        };
        it("adds a mini expansion", function () {
            expansion.init(document, data);
            expansion.addMini(fakeMini, data, document);
            const mini = document.querySelector("#fakemini");
            expect(mini).to.have.tagName("INPUT");
        });
        it("doesn't add multiple of the same mini expansion", function () {
            expansion.init(document, data);
            expansion.addMini(fakeMini, data, document);
            const minis = document.querySelectorAll("#fakemini");
            expect(minis).to.have.lengthOf(1);
        });
    });
    describe("mini expansion odds", function () {
        let cachedRandom;
        beforeEach(function () {
            cachedRandom = Math.random;
            data = boards.init(document, data);
            data = capitol.init(document, data);
            document.querySelector("#capitolOdds").checked = true;
        });
        afterEach(function () {
            Math.random = cachedRandom;
        });
        it("capitol odds of 0 result in false", function () {
            Math.random = () => 1.00;
            document.querySelector("#capitolOddsOdds").value = "0";
            const oddsResult = expansion.checkMiniOdds(data, "capitol");
            expect(oddsResult).to.equal(false);
        });
        it("Math.random odds less than 50% are false", function () {
            Math.random = () => 0.49;
            document.querySelector("#capitolOddsOdds").value = "50";
            const oddsResult = expansion.checkMiniOdds(data, "capitol");
            expect(oddsResult).to.equal(true);
        });
        it("Math.random odds more than 50% are true", function () {
            Math.random = () => 0.51;
            document.querySelector("#capitolOddsOdds").value = "50";
            const oddsResult = expansion.checkMiniOdds(data, "capitol");
            expect(oddsResult).to.equal(false);
        });
        it("capitol odds of 100% gives true", function () {
            Math.random = () => 0;
            document.querySelector("#capitolOddsOdds").value = "100";
            const oddsResult = expansion.checkMiniOdds(data, "capitol");
            expect(oddsResult).to.equal(true);
        });
    });
    describe("update", function () {
        it("passes presentData through the update", function () {
            const presentData = expansion.update({test: "a test"});
            expect(presentData.test).to.eql("a test");
        });
    });
    describe("render", function () {
        it("passes viewData through the render", function () {
            let presentData = {test: "should not be seen"};
            let viewData = {test: "successful test"};
            viewData = expansion.render(presentData, viewData);
            expect(viewData).to.have.property("test", "successful test");
        });
    });
    describe("view", function () {
        it("passes viewData through the view", function () {
            let viewData = {test: "successful test"};
            viewData = expansion.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
    });
});
