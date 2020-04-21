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
/* 
fs.rmdirSync("db", {
    recursive: true
}); */
let alpha_num = "ABCDEFGHIJKLMONPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456798";

function rand(length = 8) {
    let parts = alpha_num.split();
    let len = parts.length;
    let out = "";
    for (let i = 0; i < length; i++) {
        let i = Math.floor(Math.random() * parts.length);
        out += alpha_num[i];
    }
    return out;
}

let database = new Database("db");
if (!database.initialized) {
    database.initialize();
    database.createTable("test", ["west", rand()]);
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