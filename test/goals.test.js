/*jslint node, es6 */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const cards = require("../src/cards.js");
const boards = require("../src/boards.js");
const goals = require("../src/goals.js");
const presenter = require("../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;
const {document} = new JSDOM(docpage).window;

describe("Goals", function () {
    "use strict";
    let data;
    beforeEach(function () {
        data = {
            names: ["base", "nomads"],
            contents: {
                boards: {
                    "base": ["Board 1", "Board 2"],
                    "nomads": ["Board 3", "Board 4"]
                },
                goals: {
                    "base": ["Goal 1", "Goal 2", "Goal 3", "Goal 4"],
                    "nomads": ["Nomads Goal 1", "Nomads Goal 2"]
                }
            },
            mini: {}
        };
    });
    describe("errors", function () {
        it("throws an error when no document", function () {
            data = {contents: {}};
            const noDocument = undefined;
            expect(() => goals.init(noDocument, data)).to.throw("Missing document");
        });
    });
    describe("init", function () {
        it("adds goals HTML to the page", function () {
            if (document.querySelector(".goals")) {
                document.querySelector(".goals").remove();
            }
            expect(document.querySelectorAll(".goals").length).to.equal(0);
            boards.init(document, data);
            goals.init(document, data);
            expect(document.querySelectorAll(".goals").length).to.equal(1);
            expect(document.querySelectorAll("#c0").length).to.equal(1);
            expect(document.querySelectorAll("#c1").length).to.equal(1);
            expect(document.querySelectorAll("#c2").length).to.equal(1);
        });
        it("adds goals only once to the page", function () {
            boards.init(document, data);
            goals.init(document, data);
            expect(document.querySelectorAll(".goals").length).to.equal(1);
            goals.init(document, data);
            expect(document.querySelectorAll(".goals").length).to.equal(1);
            expect(document.querySelectorAll("#c0").length).to.equal(1);
            expect(document.querySelectorAll("#c1").length).to.equal(1);
            expect(document.querySelectorAll("#c2").length).to.equal(1);
        });
        it("adds contents property to data if missing", function () {
            data = boards.init(document, data);
            delete data.contents;
            data = goals.init(document, data);
            expect(data.contents).to.not.equal(undefined);
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = goals.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = goals.init(document, data);
            expect(data.fields.goal0.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        let cacheShuffle;
        beforeEach(function () {
            // replace shuffle with reverse for reliable testing
            cacheShuffle = cards.shuffle;
            cards.shuffle = (cards) => cards.reverse();
        });
        afterEach(function () {
            cards.shuffle = cacheShuffle;
        });
        it("adds goals to presentData", function () {
            let presentData = {};
            goals.update(data, presentData, document);
            expect(presentData.goals).to.not.equal(undefined);
        });
        it("puts together three random goals from the active expansions", function () {
            const testGoals = JSON.stringify(data.contents.goals);
            boards.init(document, data);
            goals.init(document, data);
            data.contents.goals = JSON.parse(testGoals);
            let presentData = {};
            presentData = goals.update(data, presentData, document);
            const presentGoals = presentData.goals;
            const contentsGoals = data.contents.goals;
            expect(presentGoals[0].name).to.eql(contentsGoals.base[3]);
            expect(presentGoals[1].name).to.eql(contentsGoals.base[2]);
            expect(presentGoals[2].name).to.eql(contentsGoals.base[1]);
        });
    });
    describe("goals presenter", function () {
        let goalsUpdate;
        beforeEach(function () {
            goalsUpdate = goals.update;
        });
        afterEach(function () {
            goals.update = goalsUpdate;
        });
        it("empties goals", function () {
            presenter.init();
            goals.update = function () {
                return {
                    goals: [
                        {name: "", type: ""},
                        {name: "", type: ""},
                        {name: "", type: ""}
                    ]
                };
            };
            data = {};
            const parts = [goals];
            const presentData = presenter.update(data, parts);
            expect(presentData.goals[0].name).to.equal("");
            expect(presentData.goals[1].name).to.equal("");
            expect(presentData.goals[2].name).to.equal("");
        });
        it("shows a goal", function () {
            presenter.init();
            goals.update = function () {
                return {
                    goals: [
                        {name: "Farmer"}
                    ]
                };
            };
            data = {};
            const parts = [goals];
            const presentData = presenter.update(data, parts);
            expect(presentData.goals[0].name).to.equal("Farmer");
        });
        it("shows goal with expansion type", function () {
            presenter.init();
            goals.update = function () {
                return {
                    goals: [
                        {name: "Farmer", type: "base"}
                    ]
                };
            };
            data = {};
            const parts = [goals];
            const presentData = presenter.update(data, parts);
            expect(presentData.goals[0].type).to.equal("base");
        });
    });
    describe("render", function () {
        it("can render with no goal", function () {
            const presentData = {};
            goals.render(presentData, document);
        });
    });
    describe("view", function () {
        it("can view with no goal", function () {
            const viewData = {};
            goals.view(viewData, data.fields);
        });
    });
});
