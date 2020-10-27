/*jslint node */
const html = require("../html.js");

const expansion = (function () {
    "use strict";
    const baseHref = "http://boardgamegeek.com/boardgameexpansion/117793";
    const locations = [
        "Oracle",
        "Farm",
        "Tavern",
        "Tower",
        "Harbor",
        "Paddock",
        "Barn",
        "Oasis"
    ].join(", ");
    let expansions = [];
    function initExpansion(document, data) {
        function insertAfter(before, after) {
            const parent = before.parentNode;
            parent.insertBefore(after, before.nextElementSibling);

        }
        function addExpansionsContainer(document) {
            function addSidebarContainer() {
                if (document.querySelector(".sidebar")) {
                    return;
                }
                const content = document.querySelector(".content");
                const sidebar = html.create("div", {class: "sidebar"});
                insertAfter(content, sidebar);
            }
            function addExpansionsSection() {
                if (document.querySelector(".expansions")) {
                    return;
                }
                const sidebar = document.querySelector(".sidebar");
                const expns = html.create("div", {class: "expansions"});
                const h3 = html.create("h3", {content: "EXPANSIONS"});
                const ul = html.create("ul");
                sidebar.appendChild(expns);
                expns.appendChild(h3);
                expns.appendChild(ul);
            }
            addSidebarContainer();
            addExpansionsSection();
        }
        function addBase(document, data) {
            if (!document.querySelector("#base")) {
                const ul = document.querySelector(".expansions ul");
                const li = html.create("li");
                const input = html.create("input", {
                    type: "checkbox",
                    id: "base",
                    checked: "checked"
                });
                const link = html.create("a", {
                    href: baseHref,
                    class: "base",
                    title: locations,
                    content: "Base"
                });
                ul.appendChild(li);
                li.appendChild(input);
                li.appendChild(link);
            }
            data.fields.base = document.querySelector("#base");
            return data;

        }
        html.init(document);
        data.fields = data.fields || {};
        addExpansionsContainer(document);
        return addBase(document, data);
    }
    function registerExpansions(expansionsList) {
        expansionsList.forEach(function (expansionName) {
            const expn = require("./" + expansionName + ".js");
            expansions.push(expn);
        });
        return Array.from(expansions);
    }
    function getActiveTypes(data, document) {
        const activeExpansions = data.names.filter(function isChecked(id) {
            const el = document.getElementById(id);
            return el && el.checked;
        });
        if (activeExpansions.length === 0) {
            activeExpansions.push("base");
        }
        return activeExpansions;
    }
    function findExpansion(name, sectionList, data, document) {
        const activeExpansions = getActiveTypes(data, document);
        return activeExpansions.find(function hasBoard(eachName) {
            return sectionList[eachName].includes(name);
        });
    }
    function addMini(miniData, data, document) {
        function createCheckedCheckbox(id) {
            return html.create("input", {
                type: "checkbox",
                id,
                checked: "checked"
            });
        }
        function createLink(text, href) {
            return html.create("a", {
                href,
                content: text
            });
        }
        function createCheckboxLink(id, name, href) {
            const frag = document.createDocumentFragment();
            const checkbox = createCheckedCheckbox(id);
            const space = document.createTextNode(" ");
            const link = createLink(name, href);
            frag.appendChild(checkbox);
            frag.appendChild(space);
            frag.appendChild(link);
            return frag;
        }
        function createCheckedCheckboxLink(id, name, href) {
            const checkboxLink = createCheckboxLink(id, name, href);
            const checkbox = checkboxLink.querySelector("input");
            checkbox.setAttribute("checked", "checked");
            return checkboxLink;
        }
        function createRadio(name, id) {
            return html.create("input", {
                type: "radio",
                name,
                id
            });
        }
        function createCheckedRadio(name, id) {
            const radio = createRadio(name, id);
            radio.setAttribute("checked", "checked");
            return radio;
        }
        function createUsageLink(id, name, href) {
            const frag = document.createDocumentFragment();
            let radio = createCheckedRadio(id + "RulesVsOdds", id + "Rules");
            frag.appendChild(radio);
            frag.appendChild(document.createTextNode(" "));
            frag.appendChild(createLink(name, href));
            return frag;
        }
        function createPercentField(id) {
            return html.create("input", {
                type: "number",
                id,
                value: "50",
                size: "3",
                min: "0",
                max: "100"
            });
        }
        function createOdds(id) {
            const frag = document.createDocumentFragment();
            let radio = createCheckedRadio(id + "RulesVsOdds", id + "Odds");
            radio = createRadio(id + "RulesVsOdds", id + "Odds");
            const space = document.createTextNode(" ");
            const percent = document.createTextNode("%");
            const odds = createPercentField(id + "OddsOdds");
            frag.appendChild(radio);
            frag.appendChild(space);
            frag.appendChild(odds);
            frag.appendChild(percent);
            return frag;
        }
        function addMiniHTML() {
            const ul = document.querySelector(".sidebar ul");
            const li = html.create("li");
            let checkboxLink = createCheckedCheckboxLink(id, name, href);
            const usageLink = createUsageLink(id, "usage rule", usageHref);
            const odds = createOdds(id);
            ul.appendChild(li);
            li.appendChild(checkboxLink);
            li.appendChild(usageLink);
            li.appendChild(odds);
            if (extra) {
                const extraText = document.createTextNode(" ⊚ ");
                const extraLink = createLink(extra.name, extra.href);
                li.appendChild(extraText);
                li.appendChild(extraLink);
            }
        }
        const {name, id, href, usageHref, extra, boards} = miniData;
        data.mini = data.mini || {};
        data.mini[id] = boards;
        if (document.querySelectorAll(`#${id}`).length === 0) {
            addMiniHTML();
        }
        const rulesSelector = "#" + id + "Rules";
        const oddsSelector = "#" + id + "Odds";
        const percentSelector = "#" + id + "OddsOdds";
        data.fields[id] = document.querySelector("#" + id);
        data.fields[id + "Rules"] = document.querySelector(rulesSelector);
        data.fields[id + "Odds"] = document.querySelector(oddsSelector);
        data.fields[id + "OddsOdds"] = document.querySelector(percentSelector);
        return data;
    }
    function getRuleType(data, id) {
        return (
            data.fields[id + "Rules"].checked
            ? "rules"
            : "odds"
        );
    }
    function getMinis(data) {
        const mini = Object.keys(data.mini);
        const minis = mini.reduce(function minisReducer(minis, id) {
            const miniField = data.fields[id];
            if (miniField.checked) {
                minis[id] = getRuleType(data, id);
            }
            return minis;
        }, {});
        return minis;
    }
    function checkMiniOdds(data, id) {
        function miniOdds(data, id) {
            const percentageChance = data.fields[id + "OddsOdds"].value;
            if (Number(percentageChance) === 0) {
                return false;
            }
            return Math.random() * 100 < Number(percentageChance);
        }
        if (getRuleType(data, id) === "rules") {
            return true;
        }
        return miniOdds(data, id);
    }
    function updateExpansion(presentData, ignore) {
        return presentData;
    }
    function renderExpansion(ignore, viewData) {
        return viewData;
    }
    function viewExpansion(viewData, ignore) {
        return viewData;
    }
    return {
        init: initExpansion,
        getActive: getActiveTypes,
        registerExpansions,
        findExpansion,
        addMini,
        getMinis,
        checkMiniOdds,
        update: updateExpansion,
        render: renderExpansion,
        view: viewExpansion
    };
}());
module.exports = expansion;
