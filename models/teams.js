const mongoose = require('mongoose');

// Teams schema
const teamsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    }
});

teamsSchema.index({name: 1}, {unique: true});

module.exports = mongoose.model('teams', teamsSchema);