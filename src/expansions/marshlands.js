/*jslint node */
const html = require("../html.js");
const boards = require("../boards.js");
const expansion = require("../expansions/expansion.js");

const marshlands = (function iife() {
    "use strict";
    const href = "http://boardgamegeek.com/boardgameexpansion/179622/";
    const locations = "Temple, Refuge, Canoe, Fountain";
    const boardNames = ["Canoe", "Fountain", "Temple", "Refuge"];
    const goalNames = [
        "Geologists",
        "Messengers",
        "Noblewomen",
        "Vassals",
        "Captains",
        "Scouts"
    ];
    function initMarshlands(document, data) {
        function addMarshlandsHTML(data) {
            if (!document.querySelector("#marshlands")) {
                const ul = document.querySelector(".expansions ul");
                const li = html.create("li");
                const checkbox = html.create("input", {
                    type: "checkbox",
                    id: "marshlands",
                    checked: "checked"
                });
                const link = html.create("a", {
                    href,
                    class: "marshlands",
                    title: locations,
                    content: "Marshlands"
                });
                ul.appendChild(li);
                li.appendChild(checkbox);
                li.appendChild(link);
            }
            data.fields.marshlands = document.querySelector("#marshlands");
            return data;
        }
        function addMarshlands(data) {
            data.names = data.names;
            if (!data.names.includes("marshlands")) {
                data.names.push("marshlands");
            }
            data.contents = data.contents;
            data = expansion.init(document, data);
            data = boards.addBoards("marshlands", boardNames, data);
            data.contents.goals = data.contents.goals || {};
            data.contents.goals.marshlands = goalNames;
            data = addMarshlandsHTML(data);
            return data;
        }
        html.init(document);
        data = addMarshlands(data);
        return data;
    }
    function updateMarshlands(ignore, presentData) {
        return presentData;
    }
    function marshlandsRender(ignore, viewData) {
        return viewData;
    }
    function marshlandsView(viewData, ignore) {
        return viewData;
    }
    return {
        init: initMarshlands,
        update: updateMarshlands,
        render: marshlandsRender,
        view: marshlandsView
    };
}());
module.exports = marshlands;
