/*jslint node, es6 */
const html = require("./html.js");
const cards = require("./cards.js");
const boards = require("./boards.js");

const goals = (function iife() {
    "use strict";
    const goalNames = ["Fishermen", "Miners", "Merchants", "Workers", "Discoverers", "Knights", "Hermits", "Lords", "Citizens", "Farmers"];
    function initGoals(document, data) {
        function insertAfter(before, after) {
            const parent = before.parentNode;
            parent.insertBefore(after, before.nextElementSibling);

        }
        function addGoalsHTML(data) {
            if (!document.querySelector(".goals")) {
                const boardsSection = document.querySelector(".boards");
                const goalsContainer = html.create("div", {class: "goals"});
                const heading = html.create("h3", {content: "GOALS"});
                const goal0 = html.create("output", {type: "text", id: "c0"});
                const goal1 = html.create("output", {type: "text", id: "c1"});
                const goal2 = html.create("output", {type: "text", id: "c2"});
                insertAfter(boardsSection, goalsContainer);
                goalsContainer.appendChild(heading);
                goalsContainer.appendChild(goal0);
                goalsContainer.appendChild(goal1);
                goalsContainer.appendChild(goal2);
            }
            data.fields.goal0 = document.querySelector("#c0");
            data.fields.goal1 = document.querySelector("#c1");
            data.fields.goal2 = document.querySelector("#c2");
            return data;
        }
        if (!document) {
            throw new ReferenceError("Missing document reference");
        }
        data = addGoalsHTML(data);
        data.contents = data.contents || {};
        data.contents.goals = data.contents.goals || {};
        data.contents.goals.base = goalNames;
        return data;
    }
    function updateGoals(data, presentData, document) {
        function getGoals(activeTypes, data) {
            const activeGoals = Object.keys(data.contents.goals).filter(function goalTypes(goalType) {
                return activeTypes.includes(goalType);
            });
            const joined = activeGoals.reduce(function (goalCards, goalType) {
                const goalList = data.contents.goals[goalType].map(function (name) {
                    return {name, type: goalType};
                });
                return goalCards.concat(goalList);
            }, []);
            return joined;
        }
        function sortByType(a, b) {
            const index1 = Object.keys(data.contents.goals).indexOf(a.type);
            const index2 = Object.keys(data.contents.goals).indexOf(b.type);
            return index1 - index2;
        }

        const selectedTypes = [
            "base",
            ...boards.getSelectedTypes(data, document)
        ];
        const goalCards = getGoals(selectedTypes, data);
        const randomGoals = cards.shuffle(goalCards).slice(0, 3);
        const goalsInExpansionOrder = randomGoals.sort(sortByType);
        presentData.goals = goalsInExpansionOrder;
        return presentData;
    }
    function renderGoals(presentData, viewData) {
        function renderGoal(goalConfig, item) {
            item.value = goalConfig.name;
            item.className = goalConfig.type;
            return item;
        }
        presentData.goals = presentData.goals || [];
        viewData.goals = presentData.goals.map(function (goalConfig) {
            const goalTemplate = {value: "", className: ""};
            return renderGoal(goalConfig, goalTemplate);
        });
        return viewData;
    }
    function viewGoals(viewData, fields) {
        if (!viewData.goals) {
            return viewData;
        }
        viewData.goals.forEach(function updateField(goal, i) {
            fields["goal" + i].value = goal && goal.value;
            fields["goal" + i].setAttribute("class", goal && goal.className);
        });
    }
    return {
        init: initGoals,
        update: updateGoals,
        render: renderGoals,
        view: viewGoals
    };
}());
module.exports = goals;
