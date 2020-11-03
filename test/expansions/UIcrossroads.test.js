/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const crossroads = require("../../src/expansions/crossroads.js");
const jsdom = require("jsdom");
const docpage = require("../docpage.html.js");
const {JSDOM} = jsdom;

describe("Crossroads Integration", function () {
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