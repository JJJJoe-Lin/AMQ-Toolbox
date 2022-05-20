// ==UserScript==
// @name         AMQ Downloader
// @namespace    https://github.com/JJJJoe-Lin
// @version      0.1.8
// @description  AMQ song downloader
// @author       JJJJoe
// @match        https://animemusicquiz.com/*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/common/amqToolbox.js
// @updateURL    https://raw.githubusercontent.com/JJJJoe-Lin/AMQ-Toolbox/master/amqDownloader.user.js
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

let downloadedSongSet = new Set()
let isAutoDlRunning = false;
let currentSongInfo;
let settingsData = new Map([
    [
        "enableAutoDl",
        {
            id: "amqtbOptAutoDl",
            checked: true,
            disabled: false,
            label: "Enable Auto Download",
            col: 0,
            offset: 0,
            enables: ["autoDlOnWrong", "autoDlAudio"]
        }
    ],
    [
        "autoDlOnWrong",
        {
            id: "amqtbOptAutoDlOnWrong",
            checked: false,
            disabled: true,
            label: "Auto Download On Wrong",
            col: 0,
            offset: 1
        }
    ],
    [
        "autoDlAudio",
        {
            id: "amqtbOptAutoDlAudio",
            checked: false,
            disabled: true,
            label: "Download Audio",
            col: 0,
            offset: 1
        }
    ]
]);

// *** Copied from stackoverflow ***
function downloadURL(url, filename) {
    fetch(url).then(function(t) {
        return t.blob().then((b)=>{
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.setAttribute("download", filename);
            a.click();
        }
        );
    });
}
function downloadText(text, filename) {
    var content = [text];
    var bl = new Blob(content, {type: "text/plain"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = filename;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
}

function songType(songInfo) {
    switch (songInfo.type) {
        case 1:
            return "Opening " + songInfo.typeNumber;
        case 2:
            return "Ending " + songInfo.typeNumber;
        case 3:
            return "Insert Song";
    }
};

function nameFromSongInfo(songInfo) {
    const animeName = songInfo.animeNames.romaji
    const songName = songInfo.songName
    const type = songType(songInfo)
    const artist = songInfo.artist
    return '[' + animeName + ' (' + type + ')] ' + songName + ' (' + artist + ')'
}

function AMQ_download(url, interactive=true) {
    if (url === undefined) {
        console.warn("AMQ_download: url is undefined")
        return
    }
    if (currentSongInfo === undefined) {
        console.warn("AMQ_download: currentSongInfo is undefined")
        return
    }

    let fileName = nameFromSongInfo(currentSongInfo);
    let fileExt = url.split('.').pop()

    downloadURL(url, fileName + '.' + fileExt);
    if (interactive) {
        alert('downloading song: ' + fileName);
    }
}

function autoDownload(url) {
    // Don't download the song if it is downloaded before.
    if (downloadedSongSet.has(url)) {
        return
    }
    downloadedSongSet.add(url);

    AMQ_download(url, false)
}

function createDownloadSetting() {
    amqToolbox.addSettings(settingsData);
    jQuery(() => {
        $("#amqtbOptAutoDl").on("click", function () {
            if (amqToolbox.getSetting("enableAutoDl").checked) {
                $("#amqtbAutoDl").show();
            } else {
                if (isAutoDlRunning) {
                    $("#amqtbAutoDl").trigger("click");
                }
                $("#amqtbAutoDl").hide();
            }
        });
    });
}

function createDownloadBlock() {
    const readyMsg = "Start AutoDL";
    const readyStyle = "btn-xs btn-success"
    const runningMsg = "Stop AutoDL";
    const runningStyle = "btn-xs btn-danger";
    const downloadStyle = "btn-xs btn-info";

    let autoDLBtn = $(`<button id="amqtbAutoDl"></button>`)
        .addClass(isAutoDlRunning ? runningStyle : readyStyle)
        .text(isAutoDlRunning ? runningMsg : readyMsg)
        .on("click", function () {
            isAutoDlRunning = !isAutoDlRunning;
            if (isAutoDlRunning) {
                $(this).removeClass(readyStyle)
                    .addClass(runningStyle)
                   .text(runningMsg);
            } else {
                $(this).removeClass(runningStyle)
                    .addClass(readyStyle)
                    .text(readyMsg);
            }
        });
    let videoDLBtn = $(`<button id="amqtbVideoDl"></button>`)
        .addClass(downloadStyle)
        .addClass("disabled")
        .text("Video")
        .on("click", function () {
            if ($(this).data("url") !== undefined) {
                AMQ_download($(this).data("url"));
            }
        });
    let audioDLBtn = $(`<button id="amqtbAudioDl"></button>`)
        .addClass(downloadStyle)
        .addClass("disabled")
        .text("Audio")
        .on("click", function () {
            if ($(this).data("url") !== undefined) {
                AMQ_download($(this).data("url"));
            }
        });
    let content = $(`<div class="amqtbButtonContainer"></div>`);

    content.append(autoDLBtn, videoDLBtn, audioDLBtn);
    amqToolbox.addBlock("Download", "amqtbDlBlock", content);

    if (!amqToolbox.getSetting("enableAutoDl").checked) {
        autoDLBtn.hide();
    }
}

function setup() {
    if (unsafeWindow.amqToolbox === undefined) {
        unsafeWindow.amqToolbox = new AMQ_Toolbox();
        GM_addStyle(amqToolbox.css);
    }

    createDownloadSetting();
    createDownloadBlock();

    let resultListener = new Listener(
        "answer results",
        function (result) {
            const resolutions = ["720", "480"];

            currentSongInfo = result.songInfo

            let videoURL;
            $("#amqtbVideoDl").removeData("url").addClass("disabled");
            for (let resolution of resolutions) {
                videoURL = result.songInfo.urlMap.catbox[resolution];
                if (videoURL !== undefined) {
                    $("#amqtbVideoDl").data("url", videoURL).removeClass("disabled");
                    break;
                }
            }

            let audioURL = result.songInfo.urlMap.catbox["0"];
            if (audioURL !== undefined) {
                $("#amqtbAudioDl").data("url", audioURL).removeClass("disabled");
            } else {
                $("#amqtbAudioDl").removeData("url").addClass("disabled");
            }

            if (isAutoDlRunning) {
                let isCorrect;
                let findPlayer = Object.values(quiz.players).find((tmpPlayer) => {
                    return tmpPlayer._name === selfName && tmpPlayer.avatarSlot._disabled === false
                });
                if (findPlayer !== undefined) {
                    let playerIdx = Object.values(result.players).findIndex(tmpPlayer => {
                        return findPlayer.gamePlayerId === tmpPlayer.gamePlayerId
                    });
                    isCorrect = result.players[playerIdx].correct;
                }

                if (!amqToolbox.getSetting("autoDlOnWrong").checked || !isCorrect) {
                    let dlURL
                    if (amqToolbox.getSetting("autoDlAudio").checked) {
                        dlURL = (audioURL !== undefined) ? audioURL : videoURL
                    } else {
                        dlURL = (videoURL !== undefined) ? videoURL : audioURL
                    }
                    setTimeout(() => {
                        autoDownload(dlURL);
                    }, 0);
                }
            }
        }
    );

    resultListener.bindListener();

    // create script info
    AMQ_addScriptData({
        name: "AMQ Downloader",
        author: "JJJJoe",
        description: `
            <p>TBD</p>
        `
    });
}
