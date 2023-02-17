const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
    name: String,
    user_name: String,
    password: String,
    created_at: String,
}, { collection: 'user_master' });

var userMaster = mongoose.model('user_master', schema);

module.exports = userMaster;