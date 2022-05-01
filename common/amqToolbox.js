/* require("https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js") */
class AMQ_Toolbox {
    #settingWindow;
    #tabContainer;
    #settingsData;
    #curTab;
    #curSettingContainer;

    constructor () {
        this.#settingsData = new Map();

        // Toolbox Block
        let toolboxBlock = $(`<div id="qpToolboxContainer" class="container floatingContainer"></div>`);
        toolboxBlock.insertBefore($(`#qpCheatTestCommands`));

        // Setting Window
        this.#settingWindow = new AMQWindow({
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
        this.#settingWindow.close();
        this.#settingWindow.content.addClass("tab-modal");
        this.#settingWindow.body.css("text-align", "center")
            .css("padding", "3px 15px 15px 15px");

        // Tab of Setting Window
        this.#tabContainer = $(`<div class="tabContainer"></div>`);
        this.#tabContainer.insertBefore($(`#amqtbSetting .modal-body`));

        // Option Tab
        this.addTab("Option", "amqtbOptionTab", "amqtbOptionContainer", true);

        // Option Block
        let optionBlock = $(`<div class="row"></div>`)
            .append($(`<h4><b>Option</b></h4>`))
            .append($(`<div class="col-xs-6"></div>`))      // column 0
            .append($(`<div class="col-xs-6"></div>`));     // column 1
        $(`#amqtbOptionContainer`).append(optionBlock);

        // Setting Button
        let settingButton = $(`<div id="amqtbSettingButton" class="clickAble qpOption"></div>`)
            .append($(`<i aria-hidden="true" class="fa fa-wrench qpMenuItem"></i>`))
            .on("click", () => {
                if(this.#settingWindow.isVisible()) {
                    this.#settingWindow.close();
                }
                else {
                    this.#settingWindow.open();
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

        this.css = `
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
        `;
    }

    addSettings(settings) {
        let updateEnabled = (data) => {
            if (data.enables !== undefined) {
                for (let opt of data.enables) {
                    let d = this.#settingsData.get(opt);
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
            this.#settingsData.set(data[0], data[1]);
        }
        // Refresh options block
        let optionBlock = $(`#amqtbOptionContainer .row`).eq(0);
        optionBlock.children(".col-xs-6").empty();
        for (let data of this.#settingsData.values()) {
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
                            .on("click", () => {
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
        for (let data of this.#settingsData.values()) {
            updateEnabled(data);
        }
    }

    addBlock(title, id, element) {
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

    getSetting(name) {
        return this.#settingsData.get(name);
    }

    #selectTab(tabID, containerID) {
        if (this.#curTab !== undefined && this.#curSettingContainer !== undefined) {
            this.#curTab.removeClass("selected");
            this.#curSettingContainer.addClass("hide");
        }
        $("#" + tabID).addClass("selected");
        $("#" + containerID).removeClass("hide");
        this.#curTab = $("#" + tabID);
        this.#curSettingContainer = $("#" + containerID);
    }

    addTab(title, tabID, containerID, selected=false) {
        let tab = $(`<div id="${tabID}" class="tab leftRightButtonTop clickAble"></div>`)
            .append($(`<h5>${title}</h5>`))
            .on("click", () => {
                this.#selectTab(tabID, containerID);
            });
        let container = $(`<div id="${containerID}" class="hide"></div>`);
        this.#tabContainer.append(tab);
        this.#settingWindow.body.append(container);
        if (selected) {
            this.#selectTab(tabID, containerID);
        }
    }
}