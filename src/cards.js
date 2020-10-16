/*jslint node, es6 */
const cards = (function () {
    "use strict";
    function knuthShuffle(arr) {
        let i = arr.length - 1;
        while (i > 0) {
            const rand = Math.floor((i + 1) * Math.random());
            const temp = arr[rand];
            arr[rand] = arr[i];
            arr[i] = temp;
            i -= 1;
        }
        return arr;
    }
    function draw(cards, amount) {
        return cards.slice(0, amount);
    }
    return {
        shuffle: knuthShuffle,
        draw
    };
}());
module.exports = cards;
