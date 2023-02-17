const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
    user_id: String,
    user_name: String,
    song_name: String,
    artist_name: String,
    images_path: String,
    music_path: String,
    created_at: String,
    updated_at: String,
}, { collection: 'music' });

var userMaster = mongoose.model('music', schema);

module.exports = userMaster;