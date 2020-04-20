let fs = require('fs');
const Errors = require("./error");

class Tables {
    constructor(directory, configuration_directory) {
        this.configuration_directory = configuration_directory;
        this.directory = directory;
        this.tables = [];
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
        /*         console.log(this.tables, name);
         */
        return this.tables.includes(name);
    }

    tableLoaded(name) {
        return this.table_data[name] != undefined;
    }

    loadTable(name) {
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
            fs.writeFileSync(this.directory + "/" + name + "/" + column + ".json", "[]");
        }
        fs.writeFileSync(this.configuration_directory + "/" + name + "/conf.json", JSON.stringify(configuration_data));

        let table = new Table(this.directory, this.configuration_directory, name);
        this.table_data[name] = table;
        this.tables.push(name);
        /*         console.log(this.tables);
         */
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
        this.load();
    }

    hasColumn(name) {
        return this.cache[name] != undefined;
    }

    load() {
        this.configuration_data = JSON.parse(fs.readFileSync(this.configuration_directory + "/conf.json"));
        this.columns = this.configuration_data.columns;
        for (let column of this.columns) {
            column = column.toString();
            this.cache[column] = JSON.parse(fs.readFileSync(this.directory + "/" + column + ".json"));
        }
        /*         console.log(this.cache);
         */
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
        /*         console.log(newData);
         */
        for (let i = 0; i < this.columns.length; i++) {
            let c = this.columns[i];
            this.cache[c].push(newData[i]);
        }
        this.rows++;
        this.write();
        //return newData;
    }

    write() {
        let configuration_data = {
            columns: this.columns,
            rows: this.rows
        }
        for (let column of this.columns) {
            this.writeColumn(column);
        }
        fs.writeFileSync(this.configuration_directory + "/conf.json", JSON.stringify(configuration_data));
    }

    writeColumn(name) {
        fs.writeFileSync(this.directory + "/" + name + ".json", JSON.stringify(this.cache[name]));
    }

    searchColumn(column, term) {
        if (!this.hasColumn(column)) throw new Errors.NoSuchColumnError();
        let data = this.cache[column];
        let results = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i] == term) results.push(i);
        }
        let rows = [];
        for (let r of results) {
            rows.push(this.getRow(r));
        }
        return rows;
    }

    getRows() {
        let r = [];
        for (let i = 0; i < this.rows; i++) {
            let d = [];
            for (let name in this.cache) {
                d.unshift(this.cache[name][i]);
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

module.exports = Tables;