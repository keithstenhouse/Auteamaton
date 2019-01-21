const mongoose = require('mongoose');

// Messages schema
const messagesSchema = mongoose.Schema({
    team: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    player: {
        type: String,
        required: true
    },
    datesent: {
        type: String
    },
    timesent: {
        type: String
    }
});

messagesSchema.index({team: 1, date: 1, time: 1, player: 1}, {unique: true});

module.exports = mongoose.model('messages', messagesSchema);