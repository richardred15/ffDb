let fs = require('fs');
const crypto = require('crypto');
let TableManager = require("./tables");
const Errors = require("./error");
let Configuration = require("./configuration");

class Database {
    /**
     * 
     * @param {string} directory 
     * @param {string} password?
     * @description Creates a new Database object
     */
    constructor(directory, password = 0) {
        this.key = password;
        if (this.key != 0) {
            this.key = crypto.createHash('sha256').update(String(this.key)).digest('base64').substr(0, 32);
        }
        this.directory = directory;
        this.configuration_directory = this.directory + "/.conf";
        this.table_configuration_directory = this.directory + "/.conf/tables";
        this.table_directory = this.directory + "/tables";
        this.current_table_name = null;
        this.table_manager = null;
        this.configuration = null;
        this.initialized = false;
        if (fs.existsSync(this.directory)) {
            this.load();
        }
    }

    /**
     * @description Load configuration and table manager
     */
    load() {
        if (this.key != 0) {
            Configuration.key = this.key;
        } else {
            Configuration.store_key = true;
        }
        this.configuration = new Configuration(this.configuration_directory);
        this.table_manager = new TableManager(this.table_directory, this.table_configuration_directory);
        this.initialized = true;
    }

    /**
     * @description Initialize a new database
     */
    initialize() {
        if (!this.initialized) {
            fs.mkdirSync(this.directory);
            fs.mkdirSync(this.configuration_directory);
            fs.mkdirSync(this.table_configuration_directory);
            fs.mkdirSync(this.table_directory);
            if (this.key == 0) {
                Configuration.store_key = true;
                this.key = String(Math.random());
                this.key = crypto.createHash('sha256').update(String(this.key)).digest('base64').substr(0, 32);
            }
            fs.writeFileSync(this.configuration_directory + "/conf.json", "{}");
            fs.writeFileSync(this.table_configuration_directory + "/tables.json", "[]");
            this.initialized = true;
            this.load();
        } else {
            throw new Errors.DatabaseAlreadyInitializedError();
        }
    }

    /**
     * 
     * @param {string} name 
     * @description Set active table
     */
    selectTable(name) {
        if (this.table_manager.exists(name)) {
            this.current_table_name = name;
            this.table_manager.loadTable(name);
        } else
            throw new Errors.NoSuchTableError();
    }

    /**
     * 
     * @param {string} name 
     * @param {string} term 
     * @description Search a specified column for a specified term
     */
    searchColumn(name, term) {
        return this.table_manager.searchColumn(this.current_table_name, name, term);
    }

    /**
     * @param {any[]} args
     * @description Insert row containing specified values
     */
    insertRow() {
        this.table_manager.insertRow(this.current_table_name, arguments);
    }

    /**
     * 
     * @param {object} newData {column:name,data:value}
     * @param {object} where {column:term}
     */
    updateRows(newData, where) {
        this.table_manager.updateRows(this.current_table_name, newData, where);
    }

    /**
     * @description List columns from selected table
     */
    tableColumns() {
        return this.table_manager.getColumns(this.current_table_name);
    }

    /**
     * 
     * @param {string} name?
     * @description Get all rows from selected or indicated table
     */
    getRows(name = this.current_table_name) {
        return this.table_manager.getRows(name);
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

    /**
     * 
     * @param {string} name 
     * @param {string[]} columns 
     * @description Create a new table with specified columns
     */
    createTable(name, columns) {
        if (!this.initialized) {
            throw new Errors.DatabaseNotInitializedError();
        }

        this.table_manager.createTable(name, columns);
        this.current_table_name = name;
    }
}

module.exports = Database;