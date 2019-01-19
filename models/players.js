const mongoose = require('mongoose');

// Players schema
const playersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    greeting: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    }
});

playersSchema.index({name: 1}, {unique: true});

module.exports = mongoose.model('players', playersSchema);