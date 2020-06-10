let Database = require("./src/database");
let fs = require("fs");

function fail(critical = true) {
    process.stdout.write(" (fail)\n");
    if (critical) process.exit(1);
}

function pass() {
    process.stdout.write(" (pass)\n");
}

function assert(val, message, critical = true) {
    process.stdout.write(message);
    if (val == 0 || !val) fail(critical);
    else pass();
}

console.log("Cleaning...");
fs.rmdirSync("db", {
    recursive: true
});
console.log("\n\nThe expected time values are based on my personal development system and are not actual indications of failure\n\n");

process.stdout.write("Starting Database instance...");
let database = new Database("db", undefined, {
    write_synchronous: false
});
if (database) {
    pass();
    if (!database.initialized) {
        database.initialize();
        assert(database.initialized, "Initializing Database...");
        database.createTable("test", ["west", Database.rand_safe()]);
        database.insertRow("random", "random", "", "random");
        database.createTable("users", ["username", "password", "email"]);
        assert(database.current_table_name == "users", "Creating Table...");
        database.insertRow("eric", "bill");
        database.insertRow("richardred15", "testing3");
        assert(database.getRows().length == 2, "Inserting Rows...");
        database.updateRows({
            password: "testing2",
            email: "testing123@test.com"
        }, {
            username: ".*"
        });
        let result = database.searchColumn("password", "testing2");
        assert(result && result.length == 2, "Update rows | Search Column...");
    }
    let deleted = database.deleteRows({
        username: "eric"
    });
    assert(deleted[0].username == "eric" && deleted.length == 1, "Deleting from Table...");

    database.selectTable("users");
    assert(database.current_table_name == "users", "Selecting Table...");

    let rows = database.searchColumns({
        username: "richardred15"
    });
    assert(rows.length == 1, "Searching Database...");

} else {
    fail();
}
database.selectTable("test");
let inserts = 10000;
let expected_time = 0.03 * inserts;
let start = Date.now();
for (let i = 0; i < inserts; i++) {
    database.insertRow({
        rand: Database.rand(100)
    }, Database.rand(100));
}
let time = Date.now() - start;
assert(time < expected_time, `Inserted ${inserts} rows in ${time}ms (max ${expected_time}ms)...`, false)
start = Date.now();
database.writeOut();
time = Date.now() - start;
expected_time = 100;
assert(time < expected_time, `Saving to Disk... ${time}ms...`, false)

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
assert(entropy > 5, `Testing Entropy... ${entropy} ...`);
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

process.exit(0);