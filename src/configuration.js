let fs = require("fs");

class Configuration {
    constructor(directory) {
        this.directory = directory;
        if (!fs.existsSync(this.directory + "/conf.json")) {
            throw new Errors.DatabaseNotInitializedError();
        } else {
            this.load();
        }

        this.write();
    }

    load() {
        let data = fs.readFileSync(this.directory + "/conf.json");
        if (data != "{}") {
            data = JSON.parse(data);
            this.directory = data.directory;
            if (Configuration.store_key) Configuration.key = data.key;
            Configuration.algorithm = data.algorithm;
        }
    }

    write() {
        let data = {
            directory: this.directory,
            key: Configuration.store_key ? Configuration.key : 0,
            algorithm: Configuration.algorithm
        }
        fs.writeFileSync(this.directory + "/conf.json", JSON.stringify(data));
    }
}
Configuration.algorithm = 'aes-256-ctr';
Configuration.store_key = false;

module.exports = Configuration;