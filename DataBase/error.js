class DatabaseNotInitializedError extends Error {
    constructor(message = "The database has not been initialized! Please run {database}.initialize()!") {
        super(message);
        this.name = "DatabaseNotInitializedError";
    }
}

class DatabaseAlreadyInitializedError extends Error {
    constructor(message = "Your database has already been initialized!") {
        super(message);
        this.name = "DatabaseAlreadyInitializedError";
    }
}

class TableExistsError extends Error {
    constructor(message = "The table you attempted to create already exists!") {
        super(message);
        this.name = "TableExistsError";
    }
}

class NoSuchTableError extends Error {
    constructor(message = "The table you attempted to access doesn't exist!") {
        super(message);
        this.name = "NoSuchTableError";
    }
}

class InvalidNameError extends Error {
    constructor(message = "Please use a valid string!") {
        super(message);
        this.name = "InvalidNameError";
    }
}

class NoSuchColumnError extends Error {
    constructor(message = "Specified column does not exist!") {
        super(message);
        this.name = "NoSuchColumnError";
    }
}

let Errors = {};
Errors.NoSuchTableError = NoSuchTableError;
Errors.NoSuchColumnError = NoSuchColumnError;
Errors.InvalidNameError = InvalidNameError;
Errors.TableExistsError = TableExistsError;
Errors.DatabaseAlreadyInitializedError = DatabaseAlreadyInitializedError;
Errors.DatabaseNotInitializedError = DatabaseNotInitializedError;

module.exports = Errors;