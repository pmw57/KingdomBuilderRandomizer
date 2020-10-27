/*jslint node  */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const cards = require("../src/cards.js");
const boards = require("../src/boards.js");
const goals = require("../src/goals.js");
const presenter = require("../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;

describe("Goals", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            contents: {
                boards: {
                    "base": ["Board 1", "Board 2"],
                    "nomads": ["Board 3", "Board 4"]
                },
                goals: {
                    "base": ["Goal 1", "Goal 2", "Goal 3", "Goal 4"],
                    "nomads": ["Nomads Goal 1", "Nomads Goal 2"]
                }
            }
        };
    });
    describe("init", function () {
        it("adds contents property to data if missing", function () {
            data = boards.init(document, data);
            delete data.contents;
            data = goals.init(document, data);
            expect(data.contents).to.be.an("object");
        });
        it("doesn't ruin goals when init'd multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = goals.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = goals.init(document, data);
            const goalField = data.fields.goal0;
            const parentName = goalField.parentNode.constructor.name;
            expect(parentName).to.equal("HTMLDivElement");
        });
        it("adds goals HTML to the page", function () {
            data = boards.init(document, data);
            expect(document.querySelector(".goals")).to.equal(null);
            data = goals.init(document, data);
            expect(document.querySelector(".goals")).to.have.tagName("DIV");
            expect(document.querySelector("#c0")).to.have.tagName("OUTPUT");
            expect(document.querySelector("#c1")).to.have.tagName("OUTPUT");
            expect(document.querySelector("#c2")).to.have.tagName("OUTPUT");
        });
        it("adds goals only once to the page", function () {
            data = boards.init(document, data);
            data = goals.init(document, data);
            data = goals.init(document, data);
            expect(document.querySelectorAll(".goals")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#c0")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#c1")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#c2")).to.have.lengthOf(1);
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
            expect(presentData.goals).to.be.an("array");
        });
        it("gets three random goals from the active expansions", function () {
            const testGoals = JSON.stringify(data.contents.goals);
            boards.init(document, data);
            goals.init(document, data);
            data.contents.goals = JSON.parse(testGoals);
            let presentData = {};
            presentData = goals.update(data, presentData, document);
            const presentGoals = presentData.goals;
            const contentsGoals = data.contents.goals;
            // using reverse instead of shuffle, for easier testing
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
            expect(presentData.goals[0]).to.have.property("name", "");
            expect(presentData.goals[1]).to.have.property("name", "");
            expect(presentData.goals[2]).to.have.property("name", "");
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
            expect(presentData.goals[0]).to.have.property("name", "Farmer");
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
            expect(presentData.goals[0]).to.have.property("type", "base");
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
