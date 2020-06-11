let Database = require("./src/database");
let fs = require("fs");

function fail(critical = true) {
    process.stdout.write(" ... \x1b[31m(fail)\x1b[0m\n");
    if (critical) process.exit(1);
}

function pass() {
    process.stdout.write(" ...\x1b[32m (pass)\x1b[0m\n");
}

function assert(val, message, critical = true) {
    let prefix = (critical ? "[!]" : "[?]") + " ";
    process.stdout.write(prefix + message);
    if (val == 0 || !val) fail(critical);
    else pass();
}

console.log("Cleaning...");
fs.rmdirSync("db", {
    recursive: true
});
console.log("\n\nThe expected time values are based on my personal development system [?] and are not actual indications of failure [!]\n\n");

process.stdout.write("Starting Database instance");
let database = new Database("db", "secure", {
    write_synchronous: false
});
if (database) {
    pass();
    if (!database.initialized) {
        database.initialize();
        assert(database.initialized, "Initializing Database");
        database.createTable("test", ["west", Database.rand_safe()]);
        database.insertRow("random", "random", "", "random");
        database.createTable("users", ["username", "password", "email"]);
        assert(database.current_table_name == "users", "Creating Table");
        database.insertRow("eric", "bill");
        database.insertRow("richardred15", "testing3");
        assert(database.getRows().length == 2, "Inserting Rows");
        database.updateRows({
            password: "testing2",
            email: "testing123@test.com",
            no_exist: "test"
        }, {
            username: ".*"
        });
        let result = database.searchColumn("password", "testing2");
        assert(result && result.length == 2, "Update rows | Search Column");
    }
    database.selectTable("test");
    database.selectTable("users");

    assert(database.current_table_name == "users", "Selecting Table");
    let rows = database.searchColumns({
        username: "richardred15",
        email: "testing.*"
    });
    assert(rows.length == 1, "Searching Database");

    let deleted = database.deleteRows({
        username: "eric"
    });
    assert(deleted[0].username == "eric" && deleted.length == 1, "Deleting from Table");

} else {
    fail();
}
database.selectTable("test");
let inserts = 10000;
let expected_time = (0.03 * inserts) + 5;
let start = Date.now();
for (let i = 0; i < inserts; i++) {
    database.insertRow({
        rand: Database.rand(100)
    }, Database.rand(100));
}
let time = Date.now() - start;
assert(time < expected_time, `Inserted ${inserts} rows in ${time}ms... (max ${expected_time}ms)`, false)
start = Date.now();
database.cleanup();
time = Date.now() - start;
expected_time = 100;
assert(time < expected_time, `Saving to Disk... ${time}ms`, false)

database.createColumn("jeff", "jill");
assert(database.tableColumns().indexOf('jeff') == 2 && database.getRows()[Math.floor(Math.random() * inserts)].jeff == "jill", "Creating New Column")
database.table_manager.tables[database.current_table_name].load();
assert(database.tableColumns().indexOf('jeff') == 2 && database.getRows()[Math.floor(Math.random() * inserts)].jeff == "jill", "Verifying Data on Disk")

let rands = [];
for (let i = 0; i < 100; i++) {
    let rand = Database.rand(50);
    let entropy = Database.test_random(rand);
    rands.push(entropy);
}
let entropy = 0;
let sum = 0;
rands.forEach((rand) => {
    sum += rand;
});
entropy = sum / rands.length;
assert(entropy > 5, `Testing Entropy... ${entropy} `);
let variances = [];
rands.forEach((rand) => {
    variances.push(Math.abs(entropy - rand));
});
sum = 0;
variances.forEach((variance) => {
    sum += variance;
})
let variance = sum / variances.length;

assert(variance > 0.05, "Calculating Random Variance");

database.cleanup();
delete database;
database = new Database("db", "secure", {
    write_synchronous: false
});
database.selectTable("test");
assert(database.getRows().length == inserts + 1, "Resetting and re-accessing");

process.exit(0);