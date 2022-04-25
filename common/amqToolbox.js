/* require("https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js") */
/* require("https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js") */
if (window.AMQ_Toolbox === undefined) window.AMQ_Toolbox = (function () {
    let settingWindow = null;
    let tabContainer = null;
    let settingsData = new Map();
    let curTab = null;
    let curSettingContainer = null;

    function addSettings(settings) {
        function updateEnabled(data) {
            if (data.enables !== undefined) {
                for (let opt of data.enables) {
                    let d = settingsData.get(opt);
                    if (data.checked && !data.disabled) {
                        d.disabled = false;
                        $("#" + d.id).parent().parent().removeClass("disabled");
                    } else {
                        d.disabled = true;
                        $("#" + d.id).parent().parent().addClass("disabled");
                    }
                }
            }
        }

        // add setting data
        for (let data of settings) {
            settingsData.set(data[0], data[1]);
        }
        // Refresh options block
        let optionBlock = $(`#amqtbOptionContainer .row`).eq(0);
        optionBlock.children(".col-xs-6").empty();
        for (let data of settingsData.values()) {
            data.disabled = data.offset !== 0 ? true : false;
            optionBlock.children(".col-xs-6").eq(data.col)
                .append($(`<div></div>`)
                    .addClass("customCheckboxContainer")
                    .addClass(data.offset !== 0 ? "offset" + data.offset : "")
                    .addClass(data.disabled ? "disabled" : "")
                    .append($("<div></div>")
                        .addClass("customCheckbox")
                        .append($("<input id='" + data.id + "' type='checkbox'>")
                            .prop("checked", data.checked)
                            .on("click", function () {
                                data.checked = !data.checked;
                                updateEnabled(data);
                            })
                        )
                        .append($("<label for='" + data.id + "'><i class='fa fa-check' aria-hidden='true'></i></label>"))
                    )
                    .append($("<label for='" + data.id + "'></label>")
                        .addClass("customCheckboxContainerLabel")
                        .text(data.label)
                    )
                );
        }
        // Update the enabled checkboxes after options element have arranged
        for (let data of settingsData.values()) {
            updateEnabled(data);
        }
    }

    function addBlock(title, id, element) {
        let row = $(`<div class="row"></div>`).attr("id", id);
        let header = $(`<h5 class="collapsible"></h5>`).text(title);
        // makeCollapsible
        header.on('click', function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "") {
                content.style.display = "none";
            } else {
                content.style.display = "";
            }
        })
        row.append(header, element);
        $(`#qpToolboxContainer`).append(row);
    }

    function getSetting(name) {
        return settingsData.get(name);
    }

    function selectTab(tabID, containerID) {
        if (curTab !== null && curSettingContainer !== null) {
            curTab.removeClass("selected");
            curSettingContainer.addClass("hide");
        }
        $("#" + tabID).addClass("selected");
        $("#" + containerID).removeClass("hide");
        curTab = $("#" + tabID);
        curSettingContainer = $("#" + containerID);
    }

    function addTab(title, tabID, containerID, selected=false) {
        let tab = $(`<div id="${tabID}" class="tab leftRightButtonTop clickAble"></div>`)
            .append($(`<h5>${title}</h5>`))
            .on("click", function () {
                selectTab(tabID, containerID);
            });
        let container = $(`<div id="${containerID}" class="hide"></div>`);
        tabContainer.append(tab);
        settingWindow.body.append(container);
        if (selected) {
            selectTab(tabID, containerID);
        }
    }

    // setup
    {
        // Toolbox Block
        let toolboxBlock = $(`<div id="qpToolboxContainer" class="container floatingContainer"></div>`);
        toolboxBlock.insertBefore($(`#qpCheatTestCommands`));

        // Setting Window
        settingWindow = new AMQWindow({
            title: "Toolbox Setting",
            id: "amqtbSetting",
            width: 650,
            height: 510,
            minWidth: 480,
            minHeight: 510,
            zIndex: 1060,
            resizable: true,
            draggable: true
        });
        settingWindow.close();
        settingWindow.content.addClass("tab-modal");
        settingWindow.body.css("text-align", "center")
            .css("padding", "3px 15px 15px 15px");

        // Tab of Setting Window
        tabContainer = $(`<div class="tabContainer"></div>`);
        tabContainer.insertBefore($(`#amqtbSetting .modal-body`));

        // Option Tab
        addTab("Option", "amqtbOptionTab", "amqtbOptionContainer", true);

        // Option Block
        let optionBlock = $(`<div class="row"></div>`)
            .append($(`<h4><b>Option</b></h4>`))
            .append($(`<div class="col-xs-6"></div>`))      // column 0
            .append($(`<div class="col-xs-6"></div>`));     // column 1
        $(`#amqtbOptionContainer`).append(optionBlock);

        // Setting Button
        let settingButton = $(`<div id="amqtbSettingButton" class="clickAble qpOption"></div>`)
            .append($(`<i aria-hidden="true" class="fa fa-wrench qpMenuItem"></i>`))
            .on("click", function () {
                if(settingWindow.isVisible()) {
                    settingWindow.close();
                }
                else {
                    settingWindow.open();
                }
            })
            .popover({
                placement: "bottom",
                content: "Toolbox Setting",
                trigger: "hover"
            });
        let oldWidth = $("#qpOptionContainer").width();
        $("#qpOptionContainer").width(oldWidth + 35);
        $("#qpOptionContainer > div").append(settingButton);

        // Add CSS
        AMQ_addStyle(`
            #qpToolboxContainer {
                max-width: 215px;
                min-width: 208px;
                width: calc(100% + 30px);
                position: absolute;
                border-radius: 5px;
                padding-bottom: 5px;
                padding-top: 5px;
                margin-top: 10px;
                left: 0px;
                right: 0px;
            }
            #qpToolboxContainer h5 {
                margin-top: 5px;
                margin-bottom: 5px;
            }
            .amqtbButtonContainer {
                display: flex;
                flex-flow: row wrap;
                justify-content: space-around;
                align-content: space-around;
                margin: 5px 0;
            }
            .amqtbButtonContainer button {
                margin: 5px 0;
            }
            #amqtbSettingButton {
                width: 30px;
                height: 100%;
            }
            .customCheckboxContainer {
                display: flex;
            }
            .customCheckboxContainer > div {
                display: inline-block;
                margin: 5px 0px;
            }
            .customCheckboxContainer > .customCheckboxContainerLabel {
                margin-left: 5px;
                margin-top: 5px;
                font-weight: normal;
            }
            #qpAvatarRow {
                width: 80%;
            }
            .offset1 {
                margin-left: 20px;
            }
            .offset2 {
                margin-left: 40px;
            }
            .collapsible:hover {
                background-color: #555;
            }
        `)
    }

    return {
        addSettings: addSettings,
        addBlock: addBlock,
        getSetting: getSetting,
        addTab: addTab
    }
})();