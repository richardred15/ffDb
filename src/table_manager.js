let fs = require('fs');
const Errors = require("./error");
let Encryption = require("./encryption");
let Table = require("./table");

class TableManager {
    constructor(directory, configuration_directory) {
        this.configuration_directory = configuration_directory;
        this.directory = directory;
        this.table_names = [];
        /**
         * @type {Table[]}
         */
        this.tables = {};
        this.load();
    }

    load() {
        this.table_names = JSON.parse(fs.readFileSync(this.configuration_directory + "/tables.json"));
    }

    write() {
        fs.writeFileSync(this.configuration_directory + "/tables.json", JSON.stringify(this.table_names));
    }

    awaitingWrite() {
        for (let table of this.table_names) {
            this.loadTable(table);
            if (!this.tables[table].written) return true;
        }
    }

    writeAll() {
        for (let table of this.table_names) {
            this.loadTable(table);
            if (!this.tables[table].written) {
                this.tables[table].actuallyWrite();
            }
        }
    }

    exists(name) {
        return this.table_names.includes(name);
    }

    tableLoaded(name) {
        return this.tables[name] != undefined;
    }

    loadTable(table) {
        if (!this.exists(table)) throw new Errors.NoSuchTableError();
        if (!this.tableLoaded(table))
            this.tables[table] = new Table(this.directory, this.configuration_directory, table);
    }

    getColumns(table) {
        if (this.exists(table)) {
            if (!this.tableLoaded(table)) this.loadTable(table);
            return this.tables[table].columns;
        } else {
            throw new Errors.NoSuchTableError();
        }
    }

    insertRow(table, data) {
        if (this.exists(table))
            return this.tables[table].insertRow(data);
        else throw new Errors.NoSuchTableError();
    }

    insertRowObject(table, data) {
        if (this.exists(table))
            return this.tables[table].insertRowObject(data);
        else throw new Errors.NoSuchTableError();
    }

    createColumn(table, column_name, fill) {
        if (this.exists(table))
            return this.tables[table].createColumn(column_name, fill);
        else throw new Errors.NoSuchTableError();
    }

    deleteRows(table, where, limit) {
        if (!this.exists(table)) throw new Errors.NoSuchTableError();
        return this.tables[table].deleteRows(where, limit);
    }

    updateRows(table, newData, where) {
        if (!this.exists(table)) throw new Errors.NoSuchTableError();
        this.tables[table].updateRows(newData, where);
    }

    getRows(name) {
        if (this.exists(name)) {
            return this.tables[name].getRows();
        } else {
            throw new Errors.NoSuchTableError();
        }
    }

    searchColumns(name, terms, limit, or) {
        if (this.exists(name)) {
            return this.tables[name].searchColumns(terms, limit, or);
        } else {
            throw new Errors.NoSuchTableError();
        }
    }

    searchColumn(name, column, term) {
        return this.tables[name].searchColumn(column, term);
    }

    createTable(name, columns = []) {
        if (this.table_names.includes(name)) throw new Errors.TableExistsError();
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
        fs.writeFileSync(this.configuration_directory + "/" + name + "/conf.json", JSON.stringify(configuration_data));

        let table = new Table(this.directory, this.configuration_directory, name);
        this.tables[name] = table;
        this.table_names.push(name);
        this.write();
    }
}
module.exports = TableManager;