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
    database.createTable("users", ["username", "password", "email"]);
    database.insertRow("richardred15", "testing", "richardred15@gmail.com");
    database.inserRow("eric", "testing") /* <--- All row values are not required */
    database.insertRow() /* <-- Insert an empty row */



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
```