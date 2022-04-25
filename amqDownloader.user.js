// ==UserScript==
// @name         AMQ Downloader
// @namespace    https://github.com/JJJJoe-Lin
// @version      0.1.0
// @description  AMQ song downloader
// @author       JJJJoe
// @match        https://animemusicquiz.com/*
// @grant        none
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

let song_set = new Set()
let isAutoDlRunning = false;
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
function download(url, filename) {
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

function AMQ_download(interactive=false, ignore_repeat=true, url=null) {
    const anime_name = $("#qpAnimeName").text();
	const song_name = $("#qpSongName").text();
	const type = $("#qpSongType").text();
	const singer = $("#qpSongArtist").text();
	let file_name = '[' + anime_name + ' (' + type + ')] ' + song_name + ' (' + singer + ')';

    if (url === null) {
        url = document.getElementById('qpSongVideoLink').href;
    }

    file_name = file_name.replace(/\./g, "_");

    if (anime_name == "") {
        return;
    }
    // Don't save the song if it is saved before.
    if (ignore_repeat) {
        let song_info = file_name + ': ' + url
        if (song_set.has(song_info)) {
            return;
        }
        song_set.add(song_info);
    }
	download(url, file_name);
    if (interactive == true)
        alert('downloading song: ' + file_name);
}

function createDownloadSetting() {
    AMQ_Toolbox.addSettings(settingsData);
    $("#amqtbOptAutoDl").on("click", function () {
        if (settingsData.get("enableAutoDl").checked) {
            $("#amqtbAutoDl").show();
        } else {
            if (isAutoDlRunning) {
                $("#amqtbAutoDl").trigger("click");
            }
            $("#amqtbAutoDl").hide();
        }
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
                AMQ_download(true, false, $(this).data("url"));
            }
        });
    let audioDLBtn = $(`<button id="amqtbAudioDl"></button>`)
        .addClass(downloadStyle)
        .addClass("disabled")
        .text("Audio")
        .on("click", function () {
            if ($(this).data("url") !== undefined) {
                AMQ_download(true, false, $(this).data("url"));
            }
        });
    let content = $(`<div class="amqtbButtonContainer"></div>`);
    
    content.append(autoDLBtn, videoDLBtn, audioDLBtn);
    AMQ_Toolbox.addBlock("Download", "amqtbDlBlock", content);

    if (!AMQ_Toolbox.getSetting("enableAutoDl").checked) {
        autoDLBtn.hide();
    }
}

function setup() {
    createDownloadSetting();
    createDownloadBlock();

    let resultListener = new Listener(
        "answer results",
        function (result) {
            const resolutions = ["720", "480"];

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
                
                if (!AMQ_Toolbox.getSetting("autoDlOnWrong").checked || !isCorrect) {
                    let dlURL = AMQ_Toolbox.getSetting("autoDlAudio").checked ? audioURL : videoURL;
                    dlURL = dlURL !== undefined ? dlURL : null;
                    setTimeout(() => {
                        AMQ_download(false, true, dlURL);
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