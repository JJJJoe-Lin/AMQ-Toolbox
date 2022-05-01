// ==UserScript==
// @name         AMQ No Avatar Snipe
// @namespace    https://github.com/JJJJoe-Lin
// @version      0.1.2
// @description  Avatar would not change when players answered
// @author       JJJJoe
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/common/amqToolbox.js
// @updateURL    https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/amqNoAvartarSnipe.user.js
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

let oldListener = quiz._playerAnswerListener;
let listener = new Listener("play next song", function() {});
let settingsData = new Map([
    [
        "enableNoAvatarSnipe",
        {
            id: "amqtbOptNoAvatarSnipe",
            checked: true,
            disabled: false,
            label: "Enable No Avatar Snipe",
            col: 1,
            offset: 0
        }
    ],
]);

function createSetting() {
    amqToolbox.addSettings(settingsData);
    jQuery(() => {
        $("#amqtbOptNoAvatarSnipe").on("click", function () {
            if (amqToolbox.getSetting("enableNoAvatarSnipe").checked) {
                quiz._playerAnswerListener.unbindListener();
                quiz._playerAnswerListener = listener;
                quiz._playerAnswerListener.bindListener();
            } else {
                quiz._playerAnswerListener.unbindListener();
                quiz._playerAnswerListener = oldListener;
                quiz._playerAnswerListener.bindListener();
            }
        })
    });

    if (amqToolbox.getSetting("enableNoAvatarSnipe").checked) {
        quiz._playerAnswerListener.unbindListener();
        quiz._playerAnswerListener = listener;
        quiz._playerAnswerListener.bindListener();
    }
}

function setup() {
    if (window.amqToolbox === undefined) {
        window.amqToolbox = new AMQ_Toolbox();
        AMQ_addStyle(amqToolbox.css);
    }
    
    createSetting();

    // create script info
    AMQ_addScriptData({
        name: "AMQ No Avatar Snipe",
        author: "JJJJoe",
        description: `
            <p>TBD</p>
        `
    });
}