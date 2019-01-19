const express = require('express');
const squadplayersModel = require('../models/squadplayers');
const playersModel = require('../models/players');
const teamsModel = require('../models/teams');
var squadplayers = express.Router();


//
// Squad Players home page
//
squadplayers.get('/', ensureAuthenticated, (req, res) => {
    let team = req.user.captainof;
    let query = { team: team };

    squadplayersModel.find(query, (err, squadplayers) => {
        if (err) {
            throw err;
        }

        res.render('squadplayers', {squadplayers: squadplayers});
    }).sort('name');
});


//
// Squad Players Add Form
//
squadplayers.get('/add', ensureAuthenticated, (req, res) => {
    let captainof = req.user.captainof;
    let query = { name: captainof };

    teamsModel.findOne(query, (err, team) => {
        if (err) {
            throw err;
        }

        let query = {};
        let teamgender = team.gender;
        if (teamgender != "Mixed") {
            query = { gender: teamgender };
        }

        playersModel.find(query, (err, players) => {
            if (err) {
                throw err;
            }

            let query = { team: captainof };

            squadplayersModel.find(query, (err, squadplayers) => {
                if (err) {
                    throw err;
                }

                let selectlist = [];
                for (let i in players) {
                    let found = false;
                    for (let j in squadplayers) {
                        if (players[i].name === squadplayers[j].player) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        selectlist.push(players[i]);
                    }
                }

                res.render('squadplayers-add', {players: selectlist});
            });
        }).sort('name');
    });
});

// Squad Players Add Process
squadplayers.post('/add', ensureAuthenticated, (req, res) => {
    const player = req.body.player;

    req.checkBody('player', 'Player is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        playersModel.find({}, (err, players) => {
            if (err) {
                throw err;
            }
    
            res.render('squadplayers-add', {errors: errors, players: players});
        }).sort('name');
    } else {
        let team = req.user.captainof;

        let newSquadplayer = new squadplayersModel({
            team: team,
            player: player
        });

        newSquadplayer.save(err => {
            if (err) {
                req.flash('danger', player + ' is already a member of the ' + team + ' squad');
                res.redirect('/squadplayers/add');
            } else {
                req.flash('success', 'Successfully added ' + player + ' to the ' + team + ' squad');
                res.redirect('/squadplayers');
            }
        });
    }
});


//
// Squad Players Delete Process
//
squadplayers.delete('/:id', ensureAuthenticated, (req, res) => {
    let query = {_id: req.params.id};

    squadplayersModel.deleteOne(query, err => {
        if (err) {
            req.flash('danger', 'Failed to delete the squad player');
            console.log(err);
            return;
        } else {
            req.flash('success', 'Successfully deleted the squad player');
            res.send('Succesful deletion');
        }
    });
});


//
// Access Control
//
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}


module.exports = squadplayers