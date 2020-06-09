let Database = require("./src/database");
let fs = require("fs");
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    data = data.trim();
    switch (data) {

    }

    if (data == "exit") {
        process.exit();
    }
});

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
        database.createTable("test", ["west", Database.rand()]);
        database.insertRow("random", "random", "", "random");
        database.createTable("users", ["username", "password", "email"]);
        database.insertRow("eric", "bill");
        database.updateRows({
            password: "testing2"
        }, {
            username: "richardred15"
        });
        database.updateRows({
            email: 'testing123@gmail.com'
        });
    }
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
        username: "^((?!richardred15).)*$"
    });
    if (rows.length == 1) {
        pass();
    } else {
        fail();
    }
} else {
    fail();
}
process.exit(0);
//database.selectTable("test");


/* let start = Date.now();
for (let i = 0; i < 5000; i++) {
    database.insertRow({
        rand: Database.rand(100)
    }, Database.rand(100));
}

console.log(database.searchColumn("west", "random"));
database.getRows();
console.log(Date.now() - start); */