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
    database.createTable("test", [Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString()]);
    database.createTable("users", ["username", "password", "email"]);
    database.insertRow("richardred15", "testing", "richardred15@gmail.com");
    database.insertRow("eric", "bill");
    database.updateRows({
        password: "testing2"
    }, {
        username: "richardred15"
    })
}
console.log(database.table_manager.tables);
database.selectTable("users");
let user_data = database.searchColumn("username", "richardred15");
console.log(user_data);

database.selectTable("test");
let start = Date.now();
for (let i = 0; i < 5000; i++) {
    database.insertRow(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random());
}

database.getRows();
console.log(Date.now() - start);