/*jslint node, es6 */
const {describe, it} = require("mocha");
const expect = require("chai").expect;
const presenter = require("../src/presenter.js");
const jsdom = require("jsdom");
const docpage = require("./docpage.html.js");
const {JSDOM} = jsdom;
const {document} = new JSDOM(docpage).window;

describe("Presenter", function () {
    "use strict";
    describe("presents boards", function () {
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
            expect(presentData.boards[0].name).to.equal("test1");
            expect(presentData.boards[1].name).to.equal("test2");
            expect(presentData.boards[2].name).to.equal("test3");
            expect(presentData.boards[3].name).to.equal("test4");
            expect(presentData.boards[0].type).to.equal("type1");
            expect(presentData.boards[1].type).to.equal("type2");
            expect(presentData.boards[2].type).to.equal("type3");
            expect(presentData.boards[3].type).to.equal("type4");
        });
    });
});
