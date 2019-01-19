const express = require('express');
const teamsModel = require('../models/teams');
var teams = express.Router();


//
// Teams home page
//
teams.get('/', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        teamsModel.find({}, (err, teams) => {
            if (err) {
                throw err;
            }
    
            res.render('teams', {teams: teams});
        }).sort('name');
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});


//
// Teams Add Form
//
teams.get('/add', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        res.render('teams-add');
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});

// Teams Add Process
teams.post('/add', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        const name = req.body.name;
        const gender = req.body.gender;

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('gender', 'Gender is required').notEmpty();

        let errors = req.validationErrors();

        if (errors) {
            res.render('teams-add', {
                errors: errors
            });
        } else {
            let newTeam = new teamsModel({
                name: name,
                gender: gender
            });

            newTeam.save(err => {
                if (err) {
                    console.log(err);
                    req.flash('danger', 'The team name "' + newTeam.name + '" already exists, please try another');
                    res.redirect('/teams/add');
                } else {
                    req.flash('success', newTeam.name + ' team has been added');
                    res.redirect('/teams');
                }
            });
        }
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});


//
// Teams Edit Form
//
teams.get('/edit/:id', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        let query = {_id: req.params.id};

        teamsModel.findOne(query, (err, team) => {
            if (err) {
                req.flash('danger', 'Failed to find the team to edit');
                console.log(err);
            } else {
                res.render('teams-edit', {team: team});
            }
        });
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});

// Teams Edit Process
teams.post('/edit/:id', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        // Form validation using expess-validator
        const name = req.body.name;
        const gender = req.body.gender;

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('gender', 'Gender is required').notEmpty();

        // Get Validation Errors
        let errors = req.validationErrors();

        if (errors) {
            let query = {_id: req.params.id};

            teamsModel.findOne(query, (err, team) => {
                if (err) {
                    req.flash('danger', 'Failed to find the team to edit');
                    console.log(err);
                } else {
                    res.render('teams-edit', {team: team, errors: errors});
                }
            });
        } else {
            let team = {};

            team.name = name;
            team.gender = gender;

            let query = {_id: req.params.id};

            teamsModel.updateOne(query, team, err => {
                if (err) {
                    req.flash('danger', 'Failed to update the team');
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Successfully updated the team');
                    res.redirect('/teams');
                }
            });
        }
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});


//
// Teams Delete Process
//
teams.delete('/:id', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        let query = {_id: req.params.id};

        teamsModel.deleteOne(query, err => {
            if (err) {
                req.flash('danger', 'Failed to delete the team');
                console.log(err);
                return;
            } else {
                req.flash('success', 'Successfully deleted the team');
                res.send('Succesful deletion');
            }
        });
    } else {
        res.status(500).send();
    }
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


module.exports = teams