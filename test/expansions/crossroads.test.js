/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
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
                    crossroads: [
                        "Home country",
                        "Fortress",
                        "Road",
                        "Place of refuge",
                        "Advance",
                        "Compass point"
                    ]
                }
            }
        };
    });
    describe("init", function () {
        it("adds Crossroads data", function () {
            data = {};
            data = crossroads.init(document, data);
            expect(data.names).to.include("crossroads");
            expect(data.contents.boards.crossroads).to.be.an("array");
            expect(data.contents.goals.crossroads).to.be.an("array");
            expect(data.contents.tasks.crossroads).to.be.an("array");
        });
        it("adds tasks HTML to the page", function () {
            expect(document.querySelector(".tasks")).to.equal(null);
            data = crossroads.init(document, data);
            expect(document.querySelectorAll("#t0")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t1")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t2")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t3")).to.have.lengthOf(1);
        });
        it("adds tasks only once to the page", function () {
            data = crossroads.init(document, data);
            data = crossroads.init(document, data);
            const tasks = document.querySelectorAll(".tasks");
            expect(tasks).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t0")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t1")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t2")).to.have.lengthOf(1);
            expect(document.querySelectorAll("#t3")).to.have.lengthOf(1);
        });
        it("adds expansions section", function () {
            data = crossroads.init(document, data);
            document.querySelector(".expansions").remove();
            const expansionsBefore = document.querySelectorAll(".expansions");
            expect(expansionsBefore).to.have.lengthOf(0);
            data = crossroads.init(document, data);
            const expansionsAfter = document.querySelectorAll(".expansions");
            expect(expansionsAfter).to.have.lengthOf(1);
        });
        it("adds Crossroads to expansions section", function () {
            data = crossroads.init(document, data);
            const checkbox = document.querySelectorAll("#crossroads");
            expect(checkbox).to.have.lengthOf(1);
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
                    {name: "Test Board 1"},
                    {name: "Test Board 2"}
                ]
            };
            data = crossroads.init(document, data);
            presentData = crossroads.update(data, presentData);
            const taskList = presentData.tasks;
            expect(taskList[0]).to.have.property("type", "");
            expect(taskList[1]).to.have.property("type", "");
        });
        it("one task board means one task", function () {
            Math.random = () => 0.5;
            let presentData = {
                boards: [
                    {name: "Test Board"},
                    {name: "Lighthouse"}
                ]
            };
            data = crossroads.init(document, data);
            presentData = crossroads.update(data, presentData);
            const taskList = presentData.tasks;
            expect(taskList[0]).to.have.property("type", "crossroads");
            expect(taskList[1]).to.have.property("type", "");
        });
    });
    describe("render", function () {
        it("passes viewData through without changes", function () {
            const presentData = {test: "Should not be seen"};
            let viewData = {test: "successful test"};
            viewData = crossroads.render(presentData, viewData);
            expect(viewData).to.have.property("test", "successful test");
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
            expect(viewData.tasks[0]).to.have.property("value", "Test task");
            expect(viewData.tasks[0]).to.have.property("className", "test");
        });
    });
    describe("tasks presenter", function () {
        let crossroadsUpdate;
        beforeEach(function () {
            crossroadsUpdate = crossroads.update;
            presenter.init(document, data);
        });
        afterEach(function () {
            crossroads.update = crossroadsUpdate;
        });
        it("empties tasks", function () {
            crossroads.update = function fakeUpdate() {
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
            expect(presentData.tasks[0]).to.have.property("name", "");
            expect(presentData.tasks[1]).to.have.property("name", "");
            expect(presentData.tasks[2]).to.have.property("name", "");
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
            expect(presentData.tasks[0]).to.have.property("name", "Road");
            expect(presentData.tasks[0]).to.have.property("type", "crossroads");
        });
    });
    describe("view", function () {
        it("passes viewData through without changes", function () {
            let viewData = {test: "successful test"};
            viewData = crossroads.view(viewData, data.fields);
            expect(viewData).to.have.property("test", "successful test");
        });
        it("shows tasks", function () {
            let viewData = {
                tasks: [
                    {value: "test task", className: ""},
                    {value: "", className: ""},
                    {value: "", className: ""},
                    {value: "", className: ""}
                ]
            };
            crossroads.init(document, data);
            viewData = crossroads.view(viewData, data.fields);
            const task1 = document.querySelector("#t0");
            expect(task1).to.have.tagName("OUTPUT");
            expect(task1).to.have.property("value", "test task");
        });
    });
});