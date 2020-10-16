/*jslint node, es6 */
const html = require("./html.js");
const expansion = require("./expansions/expansion.js");

const players = (function iife() {
    "use strict";
    function initPlayers(document, data) {
        html.init(document);
        data = expansion.init(document, data);
        const expansions = document.querySelector(".sidebar");
        if (!expansions.querySelector(".players")) {
            const style = html.create("style", {content: ".players {padding: 1em; margin: 0 3em; clear: left;}"});
            const p = html.create("p", {
                class: "players",
                content: "PLAYERS"
            });
            const input = html.create("input", {type: "number", id: "p", value: "5", size: "2", min: "1", max: "5"});
            const space = document.createTextNode(" ");
            const label = html.create("label", {id: "pc"});
            expansions.appendChild(style);
            expansions.appendChild(p);
            p.appendChild(space);
            p.appendChild(input);
            p.appendChild(space);
            p.appendChild(label);
        }
        data.fields.playerCount = document.querySelector("#p");
        data.fields.playerChosen = document.querySelector("#pc");
        return data;
    }
    function updatePlayers(data, presentData) {
        const playerField = data.fields.playerCount;
        const count = parseInt(playerField.value, 10);
        const startingPlayer = Math.floor(Math.random() * count) + 1;
        presentData.startingPlayer = startingPlayer;
        return presentData;
    }
    function renderPlayers(presentData, viewData) {
        const startingPlayer = presentData.startingPlayer;
        viewData.startingPlayer = "Player " + startingPlayer + " starts";
        return viewData;
    }
    function viewPlayers(viewData, fields) {
        fields.playerChosen.textContent = viewData.startingPlayer;
        return viewData;
    }
    return {
        init: initPlayers,
        update: updatePlayers,
        render: renderPlayers,
        view: viewPlayers
    };
}());
module.exports = players;
