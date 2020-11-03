/*jslint node */
const {describe, beforeEach, afterEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const crossroads = require("../../src/expansions/crossroads.js");
const presenter = require("../../src/presenter.js");

describe("Crossroads", function () {
    "use strict";
    let data;
    beforeEach(function () {
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
    describe("tasks presenter", function () {
        let crossroadsUpdate;
        beforeEach(function () {
            crossroadsUpdate = crossroads.update;
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

});