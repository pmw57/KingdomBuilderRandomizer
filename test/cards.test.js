/*jslint node, es6 */
const {describe, beforeEach, it} = require("mocha");
const expect = require("chai").expect;
const cards = require("../src/cards.js");

describe("Cards", function () {
    "use strict";
    let cardList;
    let randomTestStub;
    beforeEach(function () {
        cardList = ["Card 1", "Card 2", "Card 3", "Card 4", "Card 5", "Card 6"];
        randomTestStub = function () {
            return 0;
        };
    });
    it("shuffles the provided cards", function () {
        const cachedRandom = Math.random;
        Math.random = randomTestStub;
        const shuffled = cards.shuffle(cardList);
        Math.random = cachedRandom;
        expect(shuffled[0]).to.equal("Card 2");
        expect(shuffled[1]).to.equal("Card 3");
        expect(shuffled[2]).to.equal("Card 4");
        expect(shuffled[3]).to.equal("Card 5");
        expect(shuffled[4]).to.equal("Card 6");
        expect(shuffled[5]).to.equal("Card 1");
    });
    it("selects some cards", function () {
        const selected = cards.draw(cardList, 2);
        expect(selected.length).to.equal(2);
        expect(selected[0]).to.equal("Card 1");
        expect(selected[1]).to.equal("Card 2");
    });
});
