let Database = require("./DataBase/database");

process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
    data = data.trim();
    switch (data) {

    }

    if (data == "exit") {
        process.exit();
    }
});

let database = new Database("db");
if (!database.initialized) {
    database.initialize();
    database.createTable("test", ["one", "123"]);
    database.createTable("users", ["username", "password"]);
    database.insertRow("richardred15", "testing");
    database.insertRow("eric", "bill");
}
console.log(database.tables.tables);
database.selectTable("users");
let user_data = database.searchColumn("username", "eric");
console.log(user_data);