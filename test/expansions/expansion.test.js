/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
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
    describe("errors", function () {
        it("throws an error when given no data", function () {
            expect(() => expansion.init()).to.throw("Missing data");
        });
        it("throws an error when document not provided", function () {
            const noDocument = undefined;
            expect(
                () => expansion.init(noDocument, data)
            ).to.throw("Missing document");
        });
    });
    describe("register", function () {
        it("can register an expansion", function () {
            const expansionsList = expansion.registerExpansions(["nomads"]);
            expect(expansionsList[0].init.name).to.equal("initNomads");
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
            expect(sidebar.nodeName).to.equal("DIV");
        });
        it("adds expansions section", function () {
            expect(document.querySelector(".expansions")).to.equal(null);
            data = expansion.init(document, data);
            const expansions = document.querySelector(".expansions");
            expect(expansions.nodeName).to.equal("DIV");
        });
        it("adds base", function () {
            expect(document.querySelector("#base")).to.equal(null);
            data = expansion.init(document, data);
            const base = document.querySelector("#base");
            expect(base.nodeName).to.equal("INPUT");
        });
        it("doesn't ruin base when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = expansion.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = expansion.init(document, data);
            const baseField = data.fields.base;
            const parentName = baseField.parentNode.constructor.name;
            expect(parentName).to.equal("HTMLLIElement");
        });
    });
    describe("update", function () {
        // TODO tidy
        it("passes through playerData", function () {
            let presentData = {test: "successful"};
            presentData = expansion.update(presentData);
            expect(presentData.test).to.equal("successful");
        });
        it("uses base goals even when base boards aren't used", function () {
            data = boards.init(document, data);
            data = goals.init(document, data);
            data = expansion.init(document, data);
            let presentData = {};
            document.querySelector("#base").removeAttribute("checked");
            presentData = goals.update(data, presentData, document);
            expect(presentData.goals.length).to.equal(3);
        });
    });
    describe("finds an expansion", function () {
        // TODO tidy
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
        // TODO tidy
        beforeEach(function () {
            document.querySelectorAll(".expansions").forEach(
                (el) => el.remove()
            );
            boards.init(document, data);
            nomads.init(document, data);
            capitol.init(document, data);
        });
        it("with no expansions, defaults to only the base", function () {
            expansion.init(document, data);
            document.querySelector("#base").checked = false;
            document.querySelector("#nomads").checked = false;
            const activeExpansions = expansion.getActive(data, document);
            expect(activeExpansions).to.eql(["base"]);
        });
        it("with one expansion ticked, gives that expansion", function () {
            expansion.init(document, data);
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
    describe("gets the mini expansion settings", function () {
        // TODO tidy
        beforeEach(function () {
            document.querySelectorAll(".expansions").forEach(
                (el) => el.remove()
            );
            boards.init(document, data);
            capitol.init(document, data);
        });
        it("can init even with no mini property", function () {
            data = {names: []};
            expect(() => expansion.init(document, data)).to.not.throw();
        });
        it("gets no mini expansion settings", function () {
            document.querySelector("#capitol").checked = false;
            expansion.init(document, data);
            const miniExpansions = expansion.getMinis(data, document);
            expect(miniExpansions).to.eql({});
        });
        it("gets mini expansions rules", function () {
            document.querySelector("#capitol").checked = true;
            document.querySelector("#capitolRules").checked = true;
            expansion.init(document, data);
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
        // TODO tidy
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
            const fakeCount = document.querySelectorAll("#fakemini");
            expect(fakeCount.length).to.equal(1);
        });
        it("doesn't add multiple of the same mini expansion", function () {
            expansion.init(document, data);
            if (document.querySelector("#fakemini")) {
                document.querySelector("#fakemini").remove();
            }
            expansion.addMini(fakeMini, data, document);
            const mini = document.querySelectorAll("#fakemini");
            expect(mini.length).to.equal(1);
        });
    });
    describe("checks if a names mini expansion odds come true", function () {
        // TODO tidy
        let cachedRandom;
        beforeEach(function () {
            cachedRandom = Math.random;
            document.querySelectorAll(".expansions").forEach(
                (el) => el.remove()
            );
            data = boards.init(document, data);
            data = capitol.init(document, data);
            document.querySelector("#capitolOdds").checked = true;
            document.querySelector("#capitolOddsOdds").value = "0";
        });
        afterEach(function () {
            Math.random = cachedRandom;
            document.querySelector("#capitolOddsOdds").value = "50";
            document.querySelector("#capitolRules").checked = true;
        });
        it("capitol odds of 0 result in false", function () {
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
            document.querySelector("#capitolOddsOdds").value = "100";
            const oddsResult = expansion.checkMiniOdds(data, "capitol");
            expect(oddsResult).to.equal(true);
        });
    });
    describe("update", function () {
        // TODO tidy
        it("implements the update method", function () {
            const presentData = expansion.update({test: "a test"});
            expect(presentData.test).to.eql("a test");
        });
    });
    describe("render", function () {
        // TODO tidy
        it("passes viewData through the render", function () {
            let presentData = {test: "should not be seen"};
            let viewData = {test: "successful test"};
            viewData = expansion.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
    });
    describe("view", function () {
        // TODO tidy
        it("passes viewData through the view", function () {
            let viewData = {test: "successful test"};
            viewData = expansion.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
    });
});
