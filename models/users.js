const mongoose = require('mongoose');

// Users schema
const usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    captainof: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

usersSchema.index({username: 1}, {unique: true});

module.exports = mongoose.model('users', usersSchema);