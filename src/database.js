let fs = require('fs');
let Tables = require("./tables");
const Errors = require("./error");


class Configuration {
    constructor(directory) {
        this.directory = directory;

        if (!fs.existsSync(this.directory + "/conf.json")) {
            throw new Errors.DatabaseNotInitializedError();
        }

        this.write();
    }

    load() {

    }

    write() {
        fs.writeFileSync(this.directory + "/conf.json", JSON.stringify(this));
    }
}



class Database {
    constructor(directory) {
        this.directory = directory;
        this.configuration_directory = this.directory + "/.conf";
        this.table_config_directory = this.directory + "/.conf/tables";
        this.table_directory = this.directory + "/tables";
        this.current_table = null;
        this.tables = null;
        this.configuration = null;
        this.initialized = false;
        if (fs.existsSync(this.directory)) {
            this.load();
        }
    }

    load() {
        this.configuration = new Configuration(this.configuration_directory);
        this.tables = new Tables(this.table_directory, this.table_config_directory);
        this.initialized = true;
    }

    initialize() {
        if (!this.initialized) {
            fs.mkdirSync(this.directory);
            fs.mkdirSync(this.configuration_directory);
            fs.mkdirSync(this.table_config_directory);
            fs.mkdirSync(this.table_directory);
            fs.writeFileSync(this.configuration_directory + "/conf.json", "{}");
            fs.writeFileSync(this.table_config_directory + "/tables.json", "[]");
            this.initialized = true;
            this.load();
        } else {
            throw new Errors.DatabaseAlreadyInitializedError();
        }
    }

    selectTable(name) {
        if (this.tables.exists(name)) {
            this.current_table = name;
            this.tables.loadTable(name);
        } else
            throw new Errors.NoSuchTableError();
    }

    searchColumn(name, term) {
        return this.tables.searchColumn(this.current_table, name, term);
    }

    insertRow() {
        this.tables.insertRow(this.current_table, arguments);
    }

    tableColumns() {
        return this.tables.getColumns(this.current_table);
    }

    getRows(name = this.current_table) {
        return this.tables.getRows(name);
    }

    get() {
        if (!this.initialized) {
            throw new Errors.DatabaseNotInitializedError();
        }

    }

    set() {
        if (!this.initialized) {
            throw new Errors.DatabaseNotInitializedError();
        }

    }

    createTable(name, columns) {
        if (!this.initialized) {
            throw new Errors.DatabaseNotInitializedError();
        }

        this.tables.createTable(name, columns);
        this.current_table = name;
    }
}

module.exports = Database;