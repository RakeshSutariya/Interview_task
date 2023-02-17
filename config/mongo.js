const mongoose = require('mongoose');
const config = require('./config');

let uri = "mongodb://" + config.mongo.user + ":" + config.mongo.password + "@" + config.mongo.host + ":" + config.mongo.port + "/" + config.mongo.database;
mongoose.set('strictQuery', false);
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(error) {
    if (error) {
        console.log("=====error :: ", error);
    } else {
        console.log("Mongodb connected successfully.");
        mongoose.set("debug", (collectionName, method, query, doc) => {
            console.log("MONGO :: " + `${collectionName}.${method}(` + JSON.stringify(query) + ')');
        });
    }
});

module.exports = mongoose;