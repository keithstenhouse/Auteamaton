const express = require('express');
const playersModel = require('../models/players');
const squadplayersModel = require('../models/squadplayers');
var players = express.Router();


//
// Players home page
//
players.get('/', ensureAuthenticated, (req, res) => {
    playersModel.find({}, (err, players) => {
        if (err) {
            throw err;
        }

        res.render('players', {players: players});
    }).sort('name');
});


//
// Players Add Form
//
players.get('/add', ensureAuthenticated, (req, res) => {
    res.render('players-add');
});

// Players Add Process
players.post('/add', ensureAuthenticated, (req, res) => {
    req.checkBody('name').trim().notEmpty().withMessage('Name is required');
    req.checkBody('greeting').trim().notEmpty().withMessage('Greeting is required');
    req.checkBody('gender').trim().notEmpty().withMessage('Gender is required');
    req.checkBody('mobile').trim().notEmpty().withMessage('mobile is required');

    regex = /[^0123456789]/g
    req.body.mobile = req.body.mobile.replace(regex, '');
    req.checkBody('mobile').matches(/^447[0-9]+$/).withMessage('Must be a mobile phone number starting "447"');

    let errors = req.validationErrors();

    if (errors) {
        res.render('players-add', {
            errors: errors
        });
    } else {
        let newPlayer = new playersModel({
            name: req.body.name,
            greeting: req.body.greeting,
            gender: req.body.gender,
            mobile: req.body.mobile
        });

        newPlayer.save(err => {
            if (err) {
                req.flash('danger', 'The player name "' + newPlayer.name + '" already exists, please try another');
                res.redirect('/players/add');
            } else {
                req.flash('success', newPlayer.name + ' has been added');
                res.redirect('/players');
            }
        });
    }
});


//
// Players Edit Form
//
players.get('/edit/:id', ensureAuthenticated, (req, res) => {
    let query = {_id: req.params.id};

    playersModel.findOne(query, (err, player) => {
        if (err) {
            req.flash('danger', 'Failed to find the player to edit');
            console.log(err);
        } else {
            res.render('players-edit', {player: player});
        }
    });
});

// Players Edit Process
players.post('/edit/:id', ensureAuthenticated, (req, res) => {
    // Form validation using expess-validator
    req.checkBody('name').trim().notEmpty().withMessage('Name is required');
    req.checkBody('greeting').trim().notEmpty().withMessage('Greeting is required');
    req.checkBody('gender').trim().notEmpty().withMessage('Gender is required');
    req.checkBody('mobile').trim().notEmpty().withMessage('mobile is required');

    regex = /[^0123456789]/g
    req.body.mobile = req.body.mobile.replace(regex, '');
    req.checkBody('mobile').matches(/^447[0-9]+$/).withMessage('Must be a mobile phone number starting "447"');

    // Get Validation Errors
    let errors = req.validationErrors();

    if (errors) {
        let query = {_id: req.params.id};

        playersModel.findOne(query, (err, player) => {
            if (err) {
                req.flash('danger', 'Failed to find the player to edit');
                console.log(err);
            } else {
                res.render('teams-edit', {player: player, errors: errors});
            }
        });
    } else {
        let player = {};

        player.name = req.body.name;
        player.greeting = req.body.greeting;
        player.gender = req.body.gender;
        player.mobile = req.body.mobile;

        let query = {_id: req.params.id};

        playersModel.updateOne(query, player, err => {
            if (err) {
                req.flash('danger', 'Failed to update the player');
                console.log(err);
                return;
            } else {
                req.flash('success', 'Successfully updated the player');
                res.redirect('/players');
            }
        });
    }
});


//
// Players Delete Process
//
players.delete('/:id', ensureAuthenticated, (req, res) => {
    let query = {_id: req.params.id};

    playersModel.findOne(query, (err, player) => {
        if (err) {
            req.flash('danger', 'Failed to find the player');
            console.log(err);
            return;
        } else {
            var player = player.name;

            playersModel.deleteOne(query, err => {
                if (err) {
                    req.flash('danger', 'Failed to delete the player');
                    console.log(err);
                    return;
                } else {
                    let query = {player: player};

                    squadplayersModel.deleteMany(query, err => {
                        if (err) {
                            req.flash('danger', 'Failed to delete the player from the squads');
                            console.log(err);
                            return;
                        } else {
                            req.flash('success', 'Successfully deleted the player from the club and all squads');
                            res.send('Succesful deletion');
                        }
                    });
                }
            });
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


module.exports = players