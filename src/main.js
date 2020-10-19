/*jslint node */
const randomKB = require("../src/randomKB.js");

randomKB.init({
    expansions: [
        "nomads",
        "crossroads",
        "marshlands",
        "harvest",
        "island",
        "caves",
        "capitol"
    ]
}, document);
