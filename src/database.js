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
    constructor(directory, password = 0, options = {}) {
        if (password == {} || password == undefined || password == null || password == "") password = 0;
        this.key = password;
        if (this.key != 0) {
            this.key = crypto.createHash('sha256').update(String(this.key)).digest('base64').substr(0, 32);
        }
        this.options = {
            write_synchronous: false
        };
        Object.assign(this.options, options);
        Configuration.write_synchronous = this.options.write_synchronous;
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
        if (this.initialized) throw new Errors.DatabaseAlreadyInitializedError();
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
                this.key = Database.rand(20);
                this.key = crypto.createHash('sha256').update(String(this.key)).digest('base64').substr(0, 32);
            }
            fs.writeFileSync(this.configuration_directory + "/conf.json", "{}");
            fs.writeFileSync(this.table_configuration_directory + "/tables.json", "[]");
            this.load();
            this.initialized = true;
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
     * @param {Object} terms 
     * @param {number} limit 
     * @description Search a specified column for a specified term
     */
    searchColumns(terms, limit) {
        return this.table_manager.searchColumns(this.current_table_name, terms, limit);
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
     * @param {} where
     * @description Delete row containing specified values
     */
    deleteRows(where) {
        this.table_manager.deleteRows(this.current_table_name, where);
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
        if (this.table_manager.exists(name))
            return this.table_manager.getRows(name);
        else
            throw new Errors.NoSuchTableError();
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

    static alpha_num = "ABCDEFGHIJKLMONPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    static rand_variances = [];

    static calculateAvgVariance() {
        if (Database.rand_variances.length == 0) return 0;
        let sum = 0;
        for (let v of Database.rand_variances) {
            sum += v;
        }
        return 30.5 - (sum / Database.rand_variances.length);
    }

    static init(name, password = 0) {
        let db = new Database(name, password);
        if (!db.initialized) db.initialize();
    }
    static rand(length = 8) {
        let parts = Database.alpha_num.split("");
        let out = "";
        for (let i = 0; i < length; i++) {
            let i = Math.floor(Math.random() * parts.length);
            out += parts[i];
            Database.rand_variances.push(i);
        }
        return out;
    }
}


module.exports = Database;