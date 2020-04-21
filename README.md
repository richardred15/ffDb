# ffDb

### A simple flat file database

ffDb makes several assumptions about typical use cases for small size, low maintenance, easy to setup databases.

All data stored is encrypted, either with a provided password or one will be generated automatically.

```
> npm install --save simple-ffdb
```


## Simple Initialization

```javascript
let Database = require("simple-ffdb");
let database = new Database("database_directory", password?);
if (!database.initialized) {
    database.initialize() /* Generate folder and file structure in indicated directory */;
}
```

### Command line initialization

```
> node
> require("simple-ffdb").init(name, password?);
> .exit
```

## Simple Usage

```javascript
database.createTable("users", ["username", "password", "email"]); /* Create Table selects the created table for modification */
database.insertRow("richardred15", "testing", "richardred15@gmail.com");
database.inserRow("eric", "testing"); /* All row values are not required */
database.insertRow(); /* Insert an empty row */



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

```javascript
    let rows = database.getRows();
```

rows:
```
[
  [ 'richardred15', 'testing2', 'richardred15@gmail.com' ],
  [ 'eric', 'bill', '' ]
]
```