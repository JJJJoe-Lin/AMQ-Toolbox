// ==UserScript==
// @name         AMQ Force Skip
// @namespace    https://github.com/JJJJoe-Lin
// @version      0.1.2
// @description  Skip song without waiting buffering
// @author       JJJJoe
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/common/amqToolbox.js
// @updateURL    https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/amqForceSkip.user.js
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

let isAutoSkipRunning = false; 
let settingsData = new Map([
    [
        "enableForceSkip",
        {
            id: "amqtbOptForceSkip",
            checked: true,
            disabled: false,
            label: "Enable Force Skip",
            col: 1,
            offset: 0
        }
    ],
]);

function createSkipSetting() {
    amqToolbox.addSettings(settingsData);
    jQuery(() => {
        $("#amqtbOptForceSkip").on("click", function () {
            if (amqToolbox.getSetting("enableForceSkip").checked) {
                $("#amqtbSkipBlock").show();
            } else {
                if (isAutoSkipRunning) {
                    $("#amqtbAutoSkip").trigger("click");
                }
                $("#amqtbSkipBlock").hide();
            }
        });
    });
}

function createSkipBlock() {
    const startMsg = "Start AutoSkip";
    const startStyle = "btn-xs btn-success"
    const stopMsg = "Stop AutoSkip";
    const stopStyle = "btn-xs btn-danger";
    const onceMsg = "Skip"
    const onceStyle = "btn-xs btn-info";

    let autoBtn = $(`<button id="amqtbAutoSkip"></button>`)
        .addClass(isAutoSkipRunning ? stopStyle : startStyle)
        .text(isAutoSkipRunning ? stopMsg : startMsg)
        .on("click", function () {
            isAutoSkipRunning = !isAutoSkipRunning;
            if (isAutoSkipRunning) {
                $(this).removeClass(startStyle)
                    .addClass(stopStyle)
                    .text(stopMsg);
            } else {
                $(this).removeClass(stopStyle)
                    .addClass(startStyle)
                    .text(startMsg);
            }
        });
    let onceBtn = $(`<button id="amqtbOnceSkip"></button>`)
        .addClass(onceStyle)
        .text(onceMsg)
        .on("click", function () {
            quiz.videoReady($(this).data("songID"));
        })
    let content = $(`<div class="amqtbButtonContainer"></div>`);

    content.append(autoBtn, onceBtn);
    amqToolbox.addBlock("Force Skip", "amqtbSkipBlock", content);

    if (!amqToolbox.getSetting("enableForceSkip").checked) {
        $(`#amqtbSkipBlock`).hide();
    }
}

function setup() {
    if (window.amqToolbox === undefined) {
        window.amqToolbox = new AMQ_Toolbox();
        AMQ_addStyle(amqToolbox.css);
    }

    createSkipSetting();
    createSkipBlock();

    let resultListener = new Listener(
        "answer results",
        function () {
            $("#amqtbOnceSkip").removeClass("disabled");
            if (isAutoSkipRunning) {
                $("#amqtbOnceSkip").trigger("click");
            }
        }
    );

    let nextVideoInfoListener = new Listener(
        "quiz next video info",
        function (data) {
            let songID = data.videoInfo.id;
            $("#amqtbOnceSkip").data("songID", songID);
        }
    );

    let playNextSongListner = new Listener(
        "play next song",
        function() {
            $("#amqtbOnceSkip").addClass("disabled");
        }
    );

    resultListener.bindListener();
    nextVideoInfoListener.bindListener();
    playNextSongListner.bindListener();

    // create script info
    AMQ_addScriptData({
        name: "AMQ Force Skip",
        author: "JJJJoe",
        description: `
            <p>TBD</p>
        `
    });
}