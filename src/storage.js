/*jslint node */
const storageModule = (function iife() {
    "use strict";
    let document;
    let storage;
    function init(doc) {
        document = doc;
        storage = document.defaultView.localStorage;
    }
    function getStorage(key) {
        return storage[key];
    }
    function setStorage(key, value) {
        storage[key] = value;
    }
    function update() {
        function updateTextField(field) {
            field.value = storage[field.id] || "50";
        }
        function updateCheckbox(field) {
            field.checked = false;
            field.removeAttribute("checked");
            if (storage[field.id] !== "false") {
                field.checked = true;
                field.setAttribute("checked", "checked");
            }
        }
        function updateRadio(radioField) {
            const id = storage[radioField.name];
            const radioSelector = `[name=${radioField.name}]`;
            const radioFields = document.querySelectorAll(radioSelector);
            radioFields.forEach(function (field) {
                if (field.id === id) {
                    field.checked = true;
                    field.setAttribute("checked", "checked");
                } else {
                    field.checked = false;
                    field.removeAttribute("checked");
                }
            });
        }
        if (!storage) {
            throw new Error("No storage!");
        }
        document.querySelectorAll("input").forEach(function (field) {
            const updateType = {
                default: updateTextField,
                checkbox: updateCheckbox,
                radio: updateRadio
            };
            const fieldUpdate = updateType[field.type] || updateType.default;
            fieldUpdate(field);
        });
        return;
    }
    function inputChangeHandler(evt) {
        const el = evt.target;
        const saveType = {
            default: (el) => setStorage(el.id, el.value),
            checkbox: (el) => setStorage(el.id, String(el.checked)),
            radio: (el) => setStorage(el.name, String(el.id))
        };
        const saveField = saveType[el.type] || saveType.default;
        saveField(el);
    }
    function monitor() {
        document.querySelectorAll("input").forEach(function (field) {
            field.addEventListener("change", inputChangeHandler);
        });
    }
    return {
        init,
        get: getStorage,
        set: setStorage,
        update,
        monitor
    };
}());
module.exports = storageModule;