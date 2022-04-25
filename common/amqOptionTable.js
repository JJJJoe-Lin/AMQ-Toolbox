/* require("https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js") */
class AMQ_OptionTable {
    /**
     * 
     * @param {string} title 
     * @param {string} tableID 
     * @param {JQuery<HTMLElement>} container 
     * @param {string} cookieKey
     * @param {boolean} movable
     */
    constructor(title, tableID, container, cookieKey, movable=false) {
        this.tableID = tableID;
        this.key = cookieKey
        this.movable = movable;
        this.fields = [];

        this.saveBtn = $(`<button class="btn btn-success">Save</button>`)
            .on("click", () => {
                this.saveToCookie();
            });
        this.resetBtn = $(`<button class="btn btn-danger">Reset</button>`)
            .on("click", () => {
                this.reset();
            })

        this.table = $(`<table class="table amqtbOptTable" id="${this.tableID}"></table>`)
            .append($(`<thead></thead>`)
                .append($(`<tr></tr>`)
                    .append($(`<th>Action</th>`))
                )
            )
            .append($(`<tbody></tbody>`)
            );
        this.body = $(`<div class="row"></div>`)
            .append($(`<h4><b>${title}</b></h4>`))
            .append($(`<div></div>`)
                .append(this.table)
            )
            .append($(`<div class="amqtbButtonContainer"></div>`)
                .append($(`<button class="btn btn-success">Add New</button>`)
                    .on("click", () => {
                        this.createEntry({});
                    })
                )
                .append(this.saveBtn)
                .append(this.resetBtn)
            );
        container.append(this.body);

        // Add Class
        AMQ_addStyle(`
            .amqtbOptTable {
                border-collapse: separate;
                padding: 0 15px;
            }
            .amqtbOptTable th, #amqtbOptTable td {
                text-align: center;
                vertical-align: top;
                padding: 5px 0;
            }
            .amqtbOptTable input {
                width: 90%;
                margin: 0 auto;
            }
            .amqtbOptTable thead {
                background-color: #000;
            }
            .amqtbOptTable tbody tr {
                background-color: #424242 !important;
            }
            .amqtbOptTableCheckboxContainer > div {
                display: inline-block;
                //width: 20px;
                vertical-align: top;
            }
        `)
    }
    
    /**
     * 
     * @param {string} title column name of this option
     * @param {string} name identifier of this option
     * @param {string} type input type
     * @param {*} data content depend on input type
     */
    setField(title, name, type, data) {
        $(`<th>${title}</th>`).insertBefore($(`#${this.tableID} > thead th:last-child`));
        this.fields.push({
            name: name,
            type: type,
            data: data
        });
    }

    /**
     * 
     * @param {object} data 
     */
    createEntry(entry) {
        let row = $(`<tr></tr>`);
        // Add field
        for (let field of this.fields) {
            let td = $(`<td></td>`);
            let elem;
            switch (field.type) {
                case "text":
                    console.assert(typeof field.data === "string", `data type of ${field.name} is wrong`);
                    elem = $(`<input class="form-control input-sm" type="text"></input>`)
                        .val(entry[field.name] !== undefined ? entry[field.name] : field.data);
                    break;
                case "checkbox":
                    console.assert(Array.isArray(field.data), `data type of ${field.name} is wrong`);
                    elem = $(`<div></div>`).addClass("amqtbOptTableCheckboxContainer");
                    for (let opt of field.data) {
                        let checked = (entry[field.name] !== undefined && entry[field.name].find(opt) !== undefined)
                            ? true : false;
                        let cb = $(`<div></div>`)
                            .append($(`<label></label>`)
                                .append($(`<input type="checkbox"></input>`)
                                    .prop("checked", checked)
                                )
                                .append($(`<p>${opt}</p>`))
                            );
                        elem.append(cb);
                    }
                    break;
                default:
                    console.error(`${field.type} is not supported`);
                    continue;
            }
            row.append(td.append(elem));
        }
        // Add actions
        let actTd = $(`<td></td>`);
        let delBtn = $(`<button class="btn-sm btn-danger"></button>`)
            .append($(`<i class="fa fa-trash" style="font-size: 15px;"></i>`))
            .on("click", function () {
                row.remove();
            });
        actTd.append(delBtn);
        if (this.movable) {
            let upBtn = $(`<button class="btn-sm btn-primary"></button>`)
                .append($(`<i class="fa fa-arrow-up" style="font-size: 15px;"></i>`))
                .on("click", function () {
                    let prev = row.prev();
                    let cur = row;
                    if (prev.length != 0) {
                        cur.detach().insertBefore(prev);
                    }
                });
            let downBtn = $(`<button class="btn-sm btn-primary"></button>`)
                .append($(`<i class="fa fa-arrow-down" style="font-size: 15px;"></i>`))
                .on("click", function () {
                    let next = row.next();
                    let cur = row;
                    if (next.length != 0) {
                        cur.detach().insertAfter(next);
                    }
                });
            actTd.append(upBtn, downBtn);
        }
        row.append(actTd);
        $(`#${this.tableID} > tbody`).append(row);
    }

    import(entries) {
        for (let entry of entries) {
            // TODO: check cookie data
            this.createEntry(entry);
        }
    }

    export() {
        let entries = [];
        let fields = this.fields;
        $(`#${this.tableID} tbody tr`).each(function () {
            let entry = {};
            fields.forEach(function (field, idx) {
                let elem = $(this).find("td").eq(idx);
                switch (field.type) {
                    case "text":
                        entry[field.name] = elem.find("input").val();
                        break;
                    case "checkbox":
                        entry[field.name] = [];
                        elem.find("input:checked").each(function () {
                            entry[field.name].push($(this).siblings("p").text());
                        });
                        break;
                    default:
                        console.error(`${field.type} is not supported`);
                }
            }, this)
            entries.push(entry);
        });
        return entries;
    }

    reset() {
        $(`#${this.tableID} tbody`).empty();
        this.loadFromCookie();
    }

    loadFromCookie() {
        let val = Cookies.get(this.key);
        if (val !== undefined) {
            this.import(JSON.parse(val));
        } else {
            console.log(`${this.key} isn't in cookies`);
        }
    }

    saveToCookie() {
        let attr = {
            expires: 365,
            Domain: "animemusicquiz.com",
            secure: true
        }
        let entries = this.export();
        Cookies.set(this.key, JSON.stringify(entries), attr);
    }
}