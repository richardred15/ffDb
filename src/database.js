let fs = require('fs');
const crypto = require('crypto');
let TableManager = require("./tables");
const Errors = require("./error");
let Configuration = require("./configuration");

class Database {
    /**
     * Creates a new Database object
     * @param {string} directory The working directory for the database
     * @param {string} password? An optional password with which to encrypt the data
     * @constructor 
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
        Database.alpha_num_symbols = Database.alpha_num_symbols.split("").sort((a, b) => {
            return Math.random() - Math.random();
        }).join('');


    }

    exitHandler(table_manager) {
        if (table_manager.awaitingWrite()) {
            table_manager.writeAll();
        }
        if (arguments[1] != 0) {
            if (arguments[2] == 'uncaughtException') console.log(arguments[1]);
            process.exit(1);
        } else {
            process.exit(0);
        }
    }

    /**
     * Write all data in memory to disk
     */
    writeOut() {
        this.table_manager.writeAll();
    }

    /**
     * Load configuration and table manager
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
        //do something when app is closing
        process.on('exit', this.exitHandler.bind(null, this.table_manager));
        //catches ctrl+c event
        process.on('SIGINT', this.exitHandler.bind(null, this.table_manager));
        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', this.exitHandler.bind(null, this.table_manager));
        process.on('SIGUSR2', this.exitHandler.bind(null, this.table_manager));
        //catches uncaught exceptions
        process.on('uncaughtException', this.exitHandler.bind(null, this.table_manager));
        this.initialized = true;
    }

    /**
     * Initialize a new database
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
     * Set the working table
     * @param {string} name The name of the table you wish to select
     * @throws {DatabaseNotInitializedError}
     * @throws {NoSuchTableError}
     */
    selectTable(name) {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        if (this.table_manager.exists(name)) {
            if (this.table_manager.awaitingWrite()) this.table_manager.writeAll();
            this.current_table_name = name;
            this.table_manager.loadTable(name);
        } else
            throw new Errors.NoSuchTableError();
    }

    /**
     * Search specified columns for a specified term
     * @param {object} terms An object with column keys and data values
     * @param {number} limit Number of search results to return
     * @returns {object[]} Array of matches
     */
    searchColumns(terms, limit) {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        return this.table_manager.searchColumns(this.current_table_name, terms, limit);
    }

    /**
     * Search a specified column for a specified term
     * @param {string} name The name of the column you wish to search
     * @param {string} term The term for which you wish to search
     * @returns {object} The matching row
     */
    searchColumn(name, term) {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        return this.table_manager.searchColumn(this.current_table_name, name, term);
    }

    /**
     * Insert row containing specified values
     * @param {any[]} arguments Insert a row from an object where {column:data}
     */
    insertRow() {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        return this.table_manager.insertRow(this.current_table_name, arguments);
    }

    /**
     * Delete row containing specified values
     * @param {object} where An object defining search criteria {column:term}
     * @param {number} limit Limit the number of deleted rows
     * @returns {object[]} Deleted rows
     */
    deleteRows(where, limit) {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        return this.table_manager.deleteRows(this.current_table_name, where, limit);
    }

    /**
     * Updates rows with new data where current data matches
     * @param {object} newData {column:name,data:value}
     * @param {object} where {column:term}
     */
    updateRows(newData, where) {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        this.table_manager.updateRows(this.current_table_name, newData, where);
    }

    /**
     * List columns from selected table
     * @returns {string[]} Array of table columns
     */
    tableColumns() {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
        return this.table_manager.getColumns(this.current_table_name);
    }

    /**
     * Get all rows from selected table
     * @param {string} name? Specify a table from which to get all rows
     * @returns {object[]} Fetched rows
     */
    getRows(name = this.current_table_name) {
        if (!this.initialized) throw new Errors.DatabaseNotInitializedError();
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
     * Create a new table with specified columns
     * @param {string} name The name of the new table
     * @param {string[]} columns An array of column names
     * @throws {DatabaseNotInitializedError}
     */
    createTable(name, columns) {
        if (!this.initialized) {
            throw new Errors.DatabaseNotInitializedError();
        }
        if (this.table_manager.awaitingWrite()) this.table_manager.writeAll();
        this.table_manager.createTable(name, columns);
        this.current_table_name = name;
    }

    static alpha_num_symbols = "{}[];':\",./<>?-=_+$#@!%^&*ABCDEFGHIJKLMONPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    static alpha_num = "ABCDEFGHIJKLMONPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

    static init(name, password = 0) {
        let db = new Database(name, password);
        if (!db.initialized) db.initialize();
    }

    /**
     * Get a random string
     * @param {number} length
     * @returns {string}
     */
    static rand(length = 8) {
        let parts = Database.alpha_num_symbols.split("");

        let out = "";
        for (let i = 0; i < length; i++) {
            let i = Math.floor(Math.random() * parts.length);
            out += parts[i];
        }
        return out;
    }

    /**
     * Get a random string with only alpha-numeric values
     * @param {number} length 
     * @returns {string}
     */
    static rand_safe(length = 8) {
        let parts = Database.alpha_num.split("");

        let out = "";
        for (let i = 0; i < length; i++) {
            let i = Math.floor(Math.random() * parts.length);
            out += parts[i];
        }
        return out;
    }
    /**
     * Test a string for randomness
     * @param {string} test
     * @returns {number} 
     */
    static test_random(test) {
        let parts = test.split("");
        let n = test.length;
        let H = 0;
        let unique = [];
        for (let part of parts) {
            if (unique.indexOf(part) == -1) {
                unique.push(part);
                let c = 0;
                parts.forEach((p) => {
                    if (p == part) c++;
                });
                let p = c / n;
                H += p * Math.log2(p);
            }
        }
        return -H;
    }
}


module.exports = Database;