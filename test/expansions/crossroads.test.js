/*jslint node, es6 */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").expect;
const boards = require("../../src/boards.js");
const crossroads = require("../../src/expansions/crossroads.js");
const presenter = require("../../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Crossroads", function () {
    "use strict";
    let document;
    let data;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
        data = {
            names: ["base", "nomads"],
            miniNames: ["capitol", "caves", "island"],
            contents: {
                tasks: {
                    crossroads: ["Home country", "Fortress", "Road", "Place of refuge", "Advance", "Compass point"]
                }
            }
        };
    });
    describe("init", function () {
        it("adds tasks HTML to the page", function () {
            if (document.querySelector(".tasks")) {
                document.querySelector(".tasks").remove();
            }
            expect(document.querySelectorAll(".tasks").length).to.equal(0);
            crossroads.init(document, data);
            expect(document.querySelectorAll(".tasks").length).to.equal(1);
            expect(document.querySelectorAll("#t0").length).to.equal(1);
            expect(document.querySelectorAll("#t1").length).to.equal(1);
            expect(document.querySelectorAll("#t2").length).to.equal(1);
            expect(document.querySelectorAll("#t3").length).to.equal(1);
        });
        it("adds tasks only once to the page", function () {
            if (document.querySelector(".tasks")) {
                document.querySelector(".tasks").remove();
            }
            crossroads.init(document, data);
            crossroads.init(document, data);
            expect(document.querySelectorAll(".tasks").length).to.equal(1);
            expect(document.querySelectorAll("#t0").length).to.equal(1);
            expect(document.querySelectorAll("#t1").length).to.equal(1);
            expect(document.querySelectorAll("#t2").length).to.equal(1);
            expect(document.querySelectorAll("#t3").length).to.equal(1);
        });
        it("adds expansions section", function () {
            data = crossroads.init(document, data);
            document.querySelector(".expansions").remove();
            const expansionsBefore = document.querySelectorAll(".expansions");
            expect(expansionsBefore.length).to.equal(0);
            data = crossroads.init(document, data);
            const expansionsAfter = document.querySelectorAll(".expansions");
            expect(expansionsAfter.length).to.equal(1);
        });
        it("adds needed HTML code to the page", function () {
            data = crossroads.init(document, data);
            document.querySelector("#crossroads").remove();
            const crossroadsBefore = document.querySelectorAll("#crossroads");
            expect(crossroadsBefore.length).to.equal(0);
            data = crossroads.init(document, data);
            const crossroadsAfter = document.querySelectorAll("#crossroads");
            expect(crossroadsAfter.length).to.equal(1);
        });
        it("adds data.contents if it doesn't exist", function () {
            delete data.contents;
            data = crossroads.init(document, data);
            expect(data.contents).to.not.equal(undefined);
        });
        it("adds data.names if it doesn't exist", function () {
            delete data.names;
            data = crossroads.init(document, data);
            expect(data.names.includes("crossroads")).to.equal(true);
        });
        it("updates data.names", function () {
            data = {};
            data = crossroads.init(document, data);
            expect(data.names.includes("crossroads")).to.equal(true);
            expect(data.contents.boards.crossroads).to.be.an("array");
            expect(data.contents.goals.crossroads).to.be.an("array");
            expect(data.contents.tasks.crossroads).to.be.an("array");
        });
        it("can init multiple times", function () {
            data = {};
            data = boards.init(document, data);
            data = crossroads.init(document, data);
            data = {};
            data = boards.init(document, data);
            data = crossroads.init(document, data);
            expect(data.fields.crossroads.parentNode).to.not.equal(undefined);
            expect(data.fields.task0.parentNode).to.not.equal(undefined);
        });
    });
    describe("update", function () {
        let cacheRandom;
        beforeEach(function () {
            cacheRandom = Math.random;
        });
        afterEach(function () {
            Math.random = cacheRandom;
        });
        it("no task boards means no tasks", function () {
            let presentData = {
                boards: [
                    {name: "Tavern"},
                    {name: "Barn"}
                ]
            };
            data = crossroads.init(document, data);
            presentData = crossroads.update(data, presentData);
            expect(presentData.tasks.length).to.equal(presentData.boards.length);
        });
        it("one task board means one task", function () {
            Math.random = () => 0.5;
            let presentData = {
                boards: [
                    {name: "Tavern"},
                    {name: "Lighthouse"}
                ]
            };
            data = crossroads.init(document, data);
            presentData = crossroads.update(data, presentData);
            expect(presentData.tasks[0].type).to.equal("crossroads");
            expect(presentData.tasks[1].name).to.equal("");
        });
    });
    describe("render", function () {
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = crossroads.render(presentData, viewData);
            expect(viewData.test).to.equal("successful test");
        });
        it("renders the tasks", function () {
            const presentData = {
                tasks: [
                    {name: "Test task", type: "test"},
                    {name: "", type: ""},
                    {name: "", type: ""},
                    {name: "", type: ""}
                ]
            };
            let viewData = {};
            viewData = crossroads.render(presentData, viewData);
            expect(viewData.tasks[0].value).equal("Test task");
            expect(viewData.tasks[0].className).equal("test");
        });
    });
    describe("tasks presenter", function () {
        let crossroadsUpdate;
        beforeEach(function () {
            crossroadsUpdate = crossroads.update;
            presenter.init();
        });
        afterEach(function () {
            crossroads.update = crossroadsUpdate;
        });
        it("empties tasks", function () {
            crossroads.update = function () {
                return {
                    tasks: [
                        {name: "", type: ""},
                        {name: "", type: ""},
                        {name: "", type: ""}
                    ]
                };
            };
            data = {};
            const parts = [crossroads];
            const presentData = presenter.update(data, parts);
            expect(presentData.tasks[0].name).to.equal("");
            expect(presentData.tasks[1].name).to.equal("");
            expect(presentData.tasks[2].name).to.equal("");
        });
        it("shows a task", function () {
            crossroads.update = function () {
                return {
                    tasks: [
                        {name: "Road", type: "crossroads"}
                    ]
                };
            };
            data = {};
            const parts = [crossroads];
            const presentData = presenter.update(data, parts);
            expect(presentData.tasks[0].name).to.equal("Road");
            expect(presentData.tasks[0].type).to.equal("crossroads");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = crossroads.view(viewData, data.fields);
            expect(viewData.test).to.equal("successful test");
        });
        it("shows tasks", function () {
            let viewData = {
                tasks: [
                    {value: "test task 1", className: ""},
                    {value: "", className: ""},
                    {value: "", className: ""},
                    {value: "", className: ""}
                ]
            };
            crossroads.init(document, data);
            viewData = crossroads.view(viewData, data.fields);
            const task1 = document.querySelector("#t0");
            expect(task1.value).to.equal("test task 1");
        });
    });
});