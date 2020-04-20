# ffDb

### A simple flat file database

ffDb makes several assumptions about typical use cases for small size, low maintenance, easy to setup databases.


## Simple Initialization

```
let database = new Database("db"/* <-- Directory for database */);
if (!database.initialized) {
    database.initialize();
}
```