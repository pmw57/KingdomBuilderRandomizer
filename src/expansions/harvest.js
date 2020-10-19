/*jslint node */
const html = require("../html.js");
const boards = require("../boards.js");
const expansion = require("../expansions/expansion.js");

const harvest = (function iife() {
    "use strict";
    const href = "https://boardgamegeek.com/boardgameexpansion/195267";
    const locations = [
        "Bazaar/Water Mill",
        "Mountain Station/Scout Cabin",
        "Cathedral/Watch Tower",
        "University/Pallisade"
    ].join(", ");
    const boardsList = [
        "Bazaar",
        "Mountain Station",
        "Cathedral",
        "University"
    ];
    const goalsList = [
        "Rangers",
        "Mayors",
        "Chainers",
        "Travellers",
        "Homesteaders",
        "Rovers"
    ];
    function initHarvest(document, data) {
        function addHarvest(data) {
            if (!document.querySelector("#harvest")) {
                const ul = document.querySelector(".expansions ul");
                const li = html.create("li");
                const checkbox = html.create("input", {
                    type: "checkbox",
                    id: "harvest",
                    checked: "checked"
                });
                const link = html.create("a", {
                    content: "Harvest",
                    href,
                    class: "harvest",
                    title: locations
                });
                ul.appendChild(li);
                li.appendChild(checkbox);
                li.appendChild(link);
            }
            data.names = data.names;
            if (!data.names.includes("harvest")) {
                data.names.push("harvest");
            }
            data.contents = data.contents;
            data = boards.addBoards("harvest", boardsList, data);
            data.contents.goals = data.contents.goals || {};
            data.contents.goals.harvest = goalsList;
            data.fields.harvest = document.querySelector("#harvest");
            return data;
        }
        html.init(document);
        data = expansion.init(document, data);
        data = addHarvest(data);
        return data;
    }
    function updateHarvest(ignore, presentData) {
        return presentData;
    }
    function harvestRender(ignore, viewData) {
        return viewData;
    }
    function harvestView(viewData, ignore) {
        return viewData;
    }
    return {
        init: initHarvest,
        update: updateHarvest,
        render: harvestRender,
        view: harvestView
    };
}());
module.exports = harvest;
