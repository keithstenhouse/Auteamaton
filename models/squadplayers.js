const mongoose = require('mongoose');

// Squad Players schema
const squadplayersSchema = mongoose.Schema({
    team: {
        type: String,
        required: true
    },
    player: {
        type: String,
        required: true
    }
});

squadplayersSchema.index({team: 1, player: 1}, {unique: true});

module.exports = mongoose.model('squadplayers', squadplayersSchema);