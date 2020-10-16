/*jslint node, es6 */
const html = require("../html.js");
const cards = require("../cards.js");
const boards = require("../boards.js");
const goals = require("../goals.js");
const expansion = require("./expansion.js");

const crossroads = (function iife() {
    "use strict";
    const href = "http://boardgamegeek.com/boardgame/137396";
    const locations = "Lighthouse/Forester's Lodge, Barracks/Crossroads, City Hall/Fort, Monastery/Wagon";
    const boardNames = ["Lighthouse", "Barracks", "Monastery", "City Hall"];
    const taskNames = ["Home country", "Fortress", "Road", "Place of refuge", "Advance", "Compass point"];
    function initCrossroads(document, data) {
        function createTask(id) {
            const task = html.create("output", {
                type: "text",
                id: id
            });
            return task;
        }
        function insertAfter(before, after) {
            const parent = before.parentNode;
            parent.insertBefore(after, before.nextElementSibling);

        }
        function addTasksHTML(data) {
            function createTasks() {
                const tasks = html.create("div", {class: "tasks"});
                const heading = html.create("h3", {content: "TASKS"});
                const task0 = createTask("t0");
                const task1 = createTask("t1");
                const task2 = createTask("t2");
                const task3 = createTask("t3");
                tasks.appendChild(heading);
                tasks.appendChild(task0);
                tasks.appendChild(task1);
                tasks.appendChild(task2);
                tasks.appendChild(task3);
                return tasks;
            }
            if (!document.querySelector(".tasks")) {
                const goalsSection = document.querySelector(".goals");
                const tasksSection = createTasks();
                insertAfter(goalsSection, tasksSection);
            }
            data.fields.task0 = document.querySelector("#t0");
            data.fields.task1 = document.querySelector("#t1");
            data.fields.task2 = document.querySelector("#t2");
            data.fields.task3 = document.querySelector("#t3");
            return data;
        }
        function addCrossroadsHTML(data) {
            if (!document.querySelector(".expansions")) {
                data = expansion.init(document, data);
            }
            if (!document.querySelector("#crossroads")) {
                const ul = document.querySelector(".expansions ul");
                const li = html.create("li");
                const checkbox = html.create("input", {
                    type: "checkbox",
                    id: "crossroads",
                    checked: "checked"
                });
                const link = html.create("a", {
                    href,
                    class: "crossroads",
                    title: locations,
                    content: "Crossroads"
                });
                ul.appendChild(li);
                li.appendChild(checkbox);
                li.appendChild(link);
            }
            data.fields.crossroads = document.querySelector("#crossroads");
            return data;
        }
        function addCrossroads(data) {
            if (!data.names) {
                data = boards.init(document, data);
            }
            if (!data.names.includes("crossroads")) {
                data.names.push("crossroads");
            }
            if (!data.contents) {
                data.contents = {};
            }
            if (!data.contents.boards) {
                data = boards.init(document, data);
            }
            if (!data.contents.goals) {
                data = goals.init(document, data);
            }
            data.contents.goals.crossroads = [];
            if (!data.contents.tasks) {
                data.contents.tasks = [];
            }
            data = boards.addBoards("crossroads", boardNames, data);
            data.contents.tasks.crossroads = taskNames;
            data = addTasksHTML(data);
            data = addCrossroadsHTML(data);
            return data;
        }
        html.init(document);
        data = addCrossroads(data);
        return data;
    }
    function updateCrossroads(data, presentData) {
        function countCrossroadBoards(randomBoards, data) {
            return randomBoards.filter(function hasCrossroads(board) {
                const boardsList = data.contents.boards;
                return boardsList.crossroads.indexOf(board) > -1;
            }).length;
        }
        function pickRandom(cardList, count) {
            return cards.shuffle(cardList).slice(0, count);
        }
        function addTasks(presentData, cards) {
            function addTask(task) {
                const taskData = {
                    name: "",
                    type: ""
                };
                if (task) {
                    taskData.name = task;
                    taskData.type = "crossroads";
                }
                return taskData;
            }
            const tasks = presentData.boards.map(function (ignore, i) {
                return addTask(cards[i]);
            });
            return tasks;
        }
        const tasksList = data.contents.tasks;
        const taskCards = tasksList.crossroads;
        const mapNames = presentData.boards.map(
            (mapData) => mapData.name
        );
        const count = countCrossroadBoards(mapNames, data);
        const randomTasks = pickRandom(taskCards, count);
        presentData.tasks = addTasks(presentData, randomTasks);
        return presentData;
    }
    function renderCrossroads(presentData, viewData) {
        function renderTask(taskConfig) {
            let taskData = {};
            const nbsp = "\u00A0";
            taskData.value = taskConfig.name || nbsp;
            taskData.className = taskConfig.type || "";
            return taskData;
        }
        if (!presentData.tasks) {
            return viewData;
        }
        viewData.tasks = presentData.tasks.map(renderTask);
        return viewData;
    }
    function viewCrossroads(viewData, fields) {
        function viewTasks(viewData, fields) {
            if (!viewData || !viewData.tasks) {
                return;
            }
            viewData.tasks.forEach(function updateField(task, index) {
                fields["task" + index].value = task && task.value;
                fields["task" + index].setAttribute("class", task && task.className);
            });
        }
        viewTasks(viewData, fields);
        return viewData;
    }
    return {
        init: initCrossroads,
        update: updateCrossroads,
        render: renderCrossroads,
        view: viewCrossroads
    };
}());
module.exports = crossroads;
