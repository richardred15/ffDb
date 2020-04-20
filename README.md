# ffDb

### A simple flat file database

ffDb makes several assumptions about typical use cases for small size, low maintenance, easy to setup databases.


## Simple Initialization

```javascript
let database = new Database("db"/* <-- Directory for database */);
if (!database.initialized) {
    database.initialize();
}
```

## Simple Usage

```javascript
    database.createTable("users", ["username", "password", "email"])/* Create Table selects the created table for modification */;
    database.insertRow("richardred15", "testing", "richardred15@gmail.com");
    database.inserRow("eric", "testing") /* All row values are not required */
    database.insertRow() /* Insert an empty row */



    database.updateRows(
        /* New Values */
        {
        password: "testing2"
        },
        /* Where column matches */
        {
            username: "richardred15"
        }
    )

    database.selectTable("users")/* Switch to table */;
    let user_data = database.searchColumn("username", "richardred15");
```
user_data:
```
[
  {
    username: 'richardred15',
    password: 'testing2',
    email: 'richardred15@gmail.com'
  }
]
```