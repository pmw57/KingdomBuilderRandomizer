/*jslint node, es6 */
const html = require("../html.js");
const boards = require("../boards.js");
const expansion = require("./expansion.js");

const nomads = (function iife() {
    "use strict";
    const href = "http://boardgamegeek.com/boardgameexpansion/117793/";
    const locations = "Quarry, Caravan, Village, Garden";
    const boardNames = ["Quarry", "Caravan", "Village", "Garden"];
    const goalNames = ["Families", "Shepherds", "Ambassadors"];
    function initNomads(document, data) {
        function createCheckedCheckbox(id) {
            return html.create("input", {
                type: "checkbox",
                id,
                checked: "checked"
            });
        }
        function addNomads(data) {
            if (!document.querySelector("#nomads")) {
                const ul = document.querySelector(".expansions ul");
                const li = html.create("li");
                const checkbox = createCheckedCheckbox("nomads");
                const link = html.create("a", {
                    href,
                    class: "nomads",
                    title: locations,
                    content: "Nomads"
                });
                ul.appendChild(li);
                li.appendChild(checkbox);
                li.appendChild(link);
            }
            data.fields.nomads = document.querySelector("#nomads");
            return data;
        }
        html.init(document);
        data = expansion.init(document, data);
        if (!data.names.includes("nomads")) {
            data.names.push("nomads");
        }
        data = boards.addBoards("nomads", boardNames, data);
        data.contents.goals = data.contents.goals || {};
        data.contents.goals.nomads = goalNames;
        data = addNomads(data);
        return data;
    }
    function updateNomads(ignore, presentData) {
        return presentData;
    }
    function nomadsRender(ignore, viewData) {
        return viewData;
    }
    function nomadsView(viewData, ignore) {
        return viewData;
    }
    return {
        init: initNomads,
        update: updateNomads,
        render: nomadsRender,
        view: nomadsView
    };
}());
module.exports = nomads;
