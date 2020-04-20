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
    database.createTable("test", ["one", "123"]);
    database.createTable("users", ["username", "password"]);
    database.insertRow("richardred15", "testing");
    database.insertRow("eric", "bill");
    database.updateRows({
        password: "testing2"
    }, {
        username: "richardred15"
    })
}
console.log(database.tables.tables);
database.selectTable("users");
let user_data = database.searchColumn("username", "richardred15");
console.log(user_data);

database.selectTable("test");
database.insertRow(Math.random(), Math.random());
console.log(database.getRows());