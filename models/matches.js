const mongoose = require('mongoose');

// Matches schema
const matchesSchema = mongoose.Schema({
    team: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    rawdate: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    rawtime: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    opposition: {
        type: String,
        required: true
    }
});

matchesSchema.index({team: 1, date: 1}, {unique: true});

module.exports = mongoose.model('matches', matchesSchema);