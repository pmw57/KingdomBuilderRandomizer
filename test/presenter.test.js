/*jslint node */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").use(require("chai-dom")).expect;
const presenter = require("../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;

describe("Presenter", function () {
    "use strict";
    let document;
    beforeEach(function () {
        document = new JSDOM(docpage).window.document;
    });
    describe("presents boards", function () {
        // TODO tidy
        it("updates from a list of parts", function () {
            presenter.init();
            const partStub = {
                update: function () {
                    return {
                        boards: [
                            {name: "test1", type: "type1"},
                            {name: "test2", type: "type2"},
                            {name: "test3", type: "type3"},
                            {name: "test4", type: "type4"}
                        ]
                    };
                }
            };
            const data = {};
            const parts = [partStub];
            const presentData = presenter.update(data, parts, document);
            expect(presentData.boards[0]).to.have.property("name", "test1");
            expect(presentData.boards[1]).to.have.property("name", "test2");
            expect(presentData.boards[2]).to.have.property("name", "test3");
            expect(presentData.boards[3]).to.have.property("name", "test4");
            expect(presentData.boards[0]).to.have.property("type", "type1");
            expect(presentData.boards[1]).to.have.property("type", "type2");
            expect(presentData.boards[2]).to.have.property("type", "type3");
            expect(presentData.boards[3]).to.have.property("type", "type4");
        });
    });
});
