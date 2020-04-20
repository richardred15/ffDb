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

fs.rmdirSync("db", {
    recursive: true
});

let database = new Database("db");
if (!database.initialized) {
    database.initialize();
    database.createTable("test", ["west", Math.random().toString()]);
    database.insertRow("random", "random", "", "random");
    database.createTable("users", ["username", "password", "email"]);
    database.insertRow("richardred15", "testing", "richardred15@gmail.com");
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
console.log("Tables: " + database.table_manager.tables);
database.selectTable("users");
let user_data = database.searchColumn("username", "richardred15");
console.log("User Data: ", user_data);
console.log("Rows: " + database.getRows());

database.selectTable("test");
let start = Date.now();
for (let i = 0; i < 5000; i++) {
    database.insertRow(Math.random(), Math.random());
}

console.log(database.searchColumn("west", "random"));

database.getRows();
console.log(Date.now() - start);