let fs = require('fs');
const Errors = require("./error");
let Encryption = require("./encryption");

class TableManager {
    constructor(directory, configuration_directory) {
        this.configuration_directory = configuration_directory;
        this.directory = directory;
        this.tables = [];
        /**
         * @type {Table[]}
         */
        this.table_data = {};
        this.load();
    }

    load() {
        this.tables = JSON.parse(fs.readFileSync(this.configuration_directory + "/tables.json"));
    }

    write() {
        fs.writeFileSync(this.configuration_directory + "/tables.json", JSON.stringify(this.tables));
    }

    exists(name) {
        return this.tables.includes(name);
    }

    tableLoaded(name) {
        return this.table_data[name] != undefined;
    }

    loadTable(name) {
        if (!this.tableLoaded(name))
            this.table_data[name] = new Table(this.directory, this.configuration_directory, name);
    }

    getColumns(name) {
        if (this.exists(name)) {
            if (!this.tableLoaded(name)) this.loadTable(name);
            return this.table_data[name].columns;
        }
    }

    insertRow(name, data) {
        if (this.exists(name))
            this.table_data[name].insert(data);
        else throw new Errors.NoSuchTableError();
    }

    updateRows(table, newData, where) {
        if (!this.exists(table)) throw new Errors.NoSuchTableError();
        this.table_data[table].updateRows(newData, where);
    }

    getRows(name) {
        if (this.exists(name)) {
            return this.table_data[name].getRows();
        }
    }

    searchColumn(name, column, term) {
        return this.table_data[name].searchColumn(column, term);
    }

    createTable(name, columns = []) {
        if (this.tables.includes(name)) throw new Errors.TableExistsError();
        if (columns.length < 1) {
            throw new Error("Please provide column names!");
        }
        for (let column of columns) {
            if (typeof column != "string") throw new Errors.InvalidNameError();
        }

        let configuration_data = {
            columns: columns,
            rows: 0
        }

        fs.mkdirSync(this.configuration_directory + "/" + name)
        fs.mkdirSync(this.directory + "/" + name);
        for (let column of columns) {
            fs.writeFileSync(this.directory + "/" + name + "/" + column + ".json", Encryption.encrypt("[]"));
        }
        fs.writeFileSync(this.configuration_directory + "/" + name + "/conf.json", Encryption.encrypt(JSON.stringify(configuration_data)));

        let table = new Table(this.directory, this.configuration_directory, name);
        this.table_data[name] = table;
        this.tables.push(name);
        this.write();
    }
}

class Table {
    constructor(directory, configuration_directory, name) {
        this.name = name;
        this.configuration_directory = configuration_directory + "/" + name;
        this.directory = directory + "/" + name;
        this.columns = [];
        this.rows = 0;
        this.cache = {};
        this.write_timeout = undefined;
        this.load();
    }

    hasColumn(name) {
        return this.cache[name] != undefined;
    }

    load() {
        let data = fs.readFileSync(this.configuration_directory + "/conf.json");
        data = Encryption.decrypt(data);

        this.configuration_data = JSON.parse(data);
        this.columns = this.configuration_data.columns;
        for (let column of this.columns) {
            column = column.toString();
            data = fs.readFileSync(this.directory + "/" + column + ".json");
            data = Encryption.decrypt(data);
            this.cache[column] = JSON.parse(data);
        }
        this.rows = this.configuration_data.rows;
    }

    insert(data) {
        let newData = [];
        for (let arg in data) {
            newData.push(data[arg]);
        }
        let len = this.columns.length;
        if (len > newData.length) {
            for (let i = len - newData.length; i > 0; i--) {
                newData.push("");
            }
        }
        for (let i = 0; i < this.columns.length; i++) {
            let c = this.columns[i];
            this.cache[c].push(newData[i]);
        }
        this.rows++;
        this.write();
    }

    updateRows(newData, where) {
        if (where != undefined) {
            for (let column in where) {
                if (!this.hasColumn(column)) continue;
                let term = where[column];
                for (let i = this.rows - 1; i >= 0; i--) {
                    if (this.cache[column][i] == term) {
                        for (let col in newData) {
                            this.cache[col][i] = newData[col];
                        }
                    }
                }
            }
        } else {
            for (let i = this.rows - 1; i >= 0; i--) {
                for (let col in newData) {
                    this.cache[col][i] = newData[col];
                }
            }
        }
        this.write();
    }

    write() {
        clearTimeout(this.write_timeout);
        let instance = this;
        this.write_timeout = setTimeout(() => instance.actuallyWrite(), 0);
    }

    actuallyWrite() {
        let configuration_data = {
            columns: this.columns,
            rows: this.rows
        }
        for (let column of this.columns) {
            this.writeColumn(column);
        }
        let data = JSON.stringify(configuration_data);
        data = Encryption.encrypt(data);
        fs.writeFileSync(this.configuration_directory + "/conf.json", data);
    }

    writeColumn(name) {
        let data = JSON.stringify(this.cache[name]);
        data = Encryption.encrypt(data);
        fs.writeFileSync(this.directory + "/" + name + ".json", data);
    }

    searchColumn(column, term, limit = Infinity) {
        if (!this.hasColumn(column)) throw new Errors.NoSuchColumnError();
        if (limit == Infinity) limit = this.rows;
        if (limit == 0) return [];

        let data = this.cache[column];
        let results = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i] == term) {
                results.push(i);
                limit--;
                if (limit < 0) break;
            }
        }
        let rows = [];
        for (let r of results) {
            rows.push(this.getRow(r));
        }
        return rows;
    }

    getRows(limit = Infinity) {
        if (limit == Infinity) limit = this.rows;
        let r = [];
        for (let i = 0; i < limit; i++) {
            let d = [];
            for (let name in this.cache) {
                d.push(this.cache[name][i]);
            }
            r.push(d);
        }
        return r;
    }

    getRow(index) {
        let r = {};
        for (let name in this.cache) {
            r[name] = this.cache[name][index];
        }
        return r;
    }
}

module.exports = TableManager;