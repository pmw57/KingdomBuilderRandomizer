/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const crossroads = require("../../src/expansions/crossroads.js");

describe("Crossroads", function () {
    "use strict";
    let data;
    beforeEach(function () {
        data = {
            names: ["base", "crossroads"],
            contents: {
                boards: {
                    crossroads: ["Test Board"]
                },
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
});