let Database = require("./src/database");
let fs = require("fs");

function fail() {
    process.stdout.write(" (fail)\n");
    process.exit(1);
}

function pass() {
    process.stdout.write(" (pass)\n");
}

console.log("Cleaning...");
fs.rmdirSync("db", {
    recursive: true
});

process.stdout.write("Starting Database instance...");
let database = new Database("db", undefined, {
    write_synchronous: false
});
if (database) {
    pass();
    if (!database.initialized) {
        process.stdout.write("Initializing Database...");
        database.initialize();
        if (database.initialized) pass();
        else fail();
        database.createTable("test", ["west", Database.rand_safe()]);
        database.insertRow("random", "random", "", "random");
        database.createTable("users", ["username", "password", "email"]);
        process.stdout.write("Inserting Rows...")
        database.insertRow("eric", "bill");
        database.insertRow("richardred15", "testing3");
        if (database.getRows().length == 2) pass();
        else fail();
        process.stdout.write("Update rows | Search Column...");
        database.updateRows({
            password: "testing2",
            email: "testing123@test.com"
        }, {
            username: ".*"
        });
        let result = database.searchColumn("password", "testing2");
        if (result && result.length == 2) pass();
        else fail();
    }
    process.stdout.write("Testing row deletion...");
    let deleted = database.deleteRows({
        username: "eric"
    });
    if (deleted[0].username == "eric") pass();
    else fail();
    //console.log("Tables: " + database.table_manager.tables);
    process.stdout.write("Selecting Table...");
    database.selectTable("users");
    if (database.current_table_name == "users") pass();
    else fail();
    //let user_data = database.searchColumn("username", "richardred15");
    //console.log("User Data: ", user_data);
    //console.log("Rows: " + database.getRows());
    process.stdout.write("Searching Database...");
    let rows = database.searchColumns({
        username: "richardred15"
    });
    if (rows.length == 1) {
        pass();
    } else {
        fail();
    }
} else {
    fail();
}
database.selectTable("test");
let inserts = 10000;
let expected_time = 0.03 * inserts;
process.stdout.write(`Inserting ${inserts} random rows... `)
let start = Date.now();
for (let i = 0; i < inserts; i++) {
    database.insertRow({
        rand: Database.rand(100)
    }, Database.rand(100));
}
let time = Date.now() - start;
process.stdout.write(`Inserted in ${time}ms (max ${expected_time}ms)...`);
if (time < expected_time) pass();
else fail();
setTimeout(finish, 100);

function finish() {
    process.stdout.write(`Testing entropy (shannon)...`)
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
    process.stdout.write(entropy.toString());
    if (entropy > 5) pass();
    else {
        fail();
    }
    process.stdout.write("Calculating Random Variance...")
    let variances = [];
    rands.forEach((rand) => {
        variances.push(Math.abs(entropy - rand));
    });
    sum = 0;
    variances.forEach((variance) => {
        sum += variance;
    })
    let variance = sum / variances.length;
    if (variance > 0.05) pass();
    else fail();
    process.exit(0);
}