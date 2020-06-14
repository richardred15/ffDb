# ffDb

### A simple flat file database

ffDb makes several assumptions about typical use cases for small size, low maintenance, easy to setup databases.

All data stored is encrypted, either with a provided password or one will be generated automatically.

```
> npm install --save simple-ffdb
```

### Basic Documentation
[Database Doc](https://richard.works/projects/ffDb/doc/Database.html)

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
$ node
> require("simple-ffdb").init(name, password?);
> .exit
```

## Simple Usage

```javascript
/* Create Table selects the created table for modification */
database.createTable("users", ["username", "password", "email"]);

/* Insert a row */
database.insertRow("richardred15", "password", "richardred15@gmail.com");

/* All row values are not required */
database.inserRow("eric", "password"); 

/* Insert with key/value pairs */
database.insertRow({
  username: "foo",
  email: "baz@example.com",
  password: "bar"
})

/* Insert an empty row */
database.insertRow();


/* Set columns in a row where column value matches */
database.updateRows(
    /* New Values */
    {
        password: "new_password"
    },
    /* Where column matches */
    {
        username: "richardred15"
    }
)

/* Delete a row where columns have value, returns deleted rows */
let deleted = database.deleteRows({
  username: "foo"
})
```
deleted:
```
[
  {
    username: 'foo',
    password: 'bar',
    email: 'baz@example.com'
  }
]
```
```javascript

database.selectTable("users")/* Switch to table */;
let user_data = database.searchColumn("username", "richardred15");
```
user_data:
```
[
  {
    username: 'richardred15',
    password: 'new_password',
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
  [ 'richardred15', 'new_password', 'richardred15@gmail.com' ],
  [ 'eric', 'password', '' ],
  [ '', '', '' ]
]
```