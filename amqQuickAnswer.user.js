// ==UserScript==
// @name         AMQ Quick Answer
// @namespace    https://github.com/JJJJoe-Lin
// @version      0.1.0
// @description  AMQ Quick-Answer Buttons.
// @author       JJJJoe
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/common/amqToolbox.js
// @require      https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/common/amqOptionTable.js
// @updateURL    https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/amqQuickAnswer.user.js
// ==/UserScript==

// don't load on login page
if (document.getElementById("startPage")) return;

// Wait until the LOADING... screen is hidden and load script
let loadInterval = setInterval(() => {
    if (document.getElementById("loadingScreen").classList.contains("hidden")) {
        setup();
        clearInterval(loadInterval);
    }
}, 500);

function pressEnter(id) {
    var e = jQuery.Event("keypress");
    e.which = 13; //choose the one you want
    e.keyCode = 13;
    $("#" + id).trigger(e);
}

function refreshAnswerButton() {
    const ansStyle = "btn-xs btn-primary";
    let val = Cookies.get("quickAnsList");
    const ansList = (val !== undefined) ? JSON.parse(val) : undefined;

    $(`#amqtbQuickAnsBlock .amqtbButtonContainer`).empty();
    for (let ans of ansList !== undefined ? ansList : []) {
        let curBtn = $(`<button></button>`)
            .addClass(ansStyle)
            .text(ans.displayName)
            .on("click", function () {
                let input = $(`#qpAnswerInput`);
                if (input.prop("disabled")) {
                    return false;
                }
                input.prop("value", ans.animeName);
                pressEnter("qpAnswerInput");
            });
        $(`#amqtbQuickAnsBlock .amqtbButtonContainer`).append(curBtn);
    }
}

function createQuickAnsSetting() {
    AMQ_Toolbox.addTab("Quick Ans", "amqtbQuickAnsSettingTab", "amqtbQuickAnsSettingContainer");
    let table = new AMQ_OptionTable(
        "Quick Answer List", 
        "amqtbAnsTable", 
        $(`#amqtbQuickAnsSettingContainer`),
        "quickAnsList",
        true);
    table.saveBtn.on("click", refreshAnswerButton);
    table.setField("Display Name", "displayName", "text", "");
    table.setField("Anime Name", "animeName", "text", "");
    table.reset();
}

function createQuickAnsBlock() {
    let content = $(`<div class="amqtbButtonContainer"></div>`);
    AMQ_Toolbox.addBlock("Quick Answer", "amqtbQuickAnsBlock", content);
    refreshAnswerButton();
}

function setup() {
    createQuickAnsSetting();
    createQuickAnsBlock();

    // create script info
    AMQ_addScriptData({
        name: "AMQ Quick Answer",
        author: "JJJJoe",
        description: `
            <p>TBD</p>
        `
    });
}