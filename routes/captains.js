const express = require('express');
const bcrypt = require('bcryptjs');
const usersModel = require('../models/users');
const teamsModel = require('../models/teams');
var captains = express.Router();


//
// Captains Home Page
//
captains.get('/', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        teamsModel.find({}, (err, teams) => {
            if (err) {
                throw err;
            }

            usersModel.find({}, (err, users) => {
                if (err) {
                    throw err;
                }

                res.render('captains', {teams: teams, captains: users});
            }).sort('captainof');
        }).sort('name');
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});


//
// Captains Add Form
//
captains.get('/add', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        teamsModel.find({}, (err, teams) => {
            if (err) {
                throw err;
            }

            res.render('captains-add', {teams: teams});
        }).sort('name');
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});

// Captains Process
captains.post('/add', (req, res) => {
    if (req.user.captainof == 'admin') {
        const name = req.body.name;
        const username = req.body.username;
        const mobile = req.body.mobile;
        const captainof = req.body.captainof;
        const password = req.body.password;

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('mobile', 'Mobile is required').notEmpty();
        req.checkBody('captainof', 'Captain of Which Team is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password2', 'Passwords do not match').equals(password);

        let errors = req.validationErrors();

        if (errors) {
            teamsModel.find({}, (err, teams) => {
                if (err) {
                    throw err;
                }

                res.render('captains-add', {errors: errors, teams: teams});
            });
        } else {
            let newUser = new usersModel({
                name: name,
                username: username,
                mobile: mobile,
                captainof: captainof,
                password: password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, pwhash) => {
                    if (err) {
                        console.log(err);
                        req.flash('danger', 'Something went wrong when trying to encrypt the password, please try again');
                        res.redirect('/captains/add');
                    }
                    newUser.password = pwhash;

                    newUser.save(err => {
                        if (err) {
                            req.flash('danger', 'The username "' + username + '" is already taken, please try another');
                            res.redirect('/captains/add');
                        } else {
                            req.flash('success', newUser.username + ' has now been registered and can log in');
                            res.redirect('/captains');
                        }
                    });
                });
            });
        }
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});


//
// Captains Edit Form
//
captains.get('/edit/:id', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        teamsModel.find({}, (err, teams) => {
            if (err) {
                throw err;
            }

            let query = {_id: req.params.id};

            usersModel.findOne(query, (err, user) => {
                if (err) {
                    req.flash('danger', 'Failed to find the captain to edit');
                    console.log(err);
                } else {
                    res.render('captains-edit', {teams: teams, captain: user});
                }
            }).sort('captainof');
        }).sort('name');
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});

// Captains Edit Process
captains.post('/edit/:id', ensureAuthenticated, (req, res) => {
    if (req.user.captainof == 'admin') {
        // Form validation using expess-validator
        const name = req.body.name;
        const username = req.body.username;
        const mobile = req.body.mobile;
        const captainof = req.body.captainof;

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('mobile', 'Mobile is required').notEmpty();
        req.checkBody('captainof', 'Captain of Which Team is required').notEmpty();

        // Get Validation Errors
        let errors = req.validationErrors();

        if (errors) {
            let query = {_id: req.params.id};

            usersModel.findOne(query, (err, user) => {
                if (err) {
                    req.flash('danger', 'Failed to find the captain to edit');
                    console.log(err);
                } else {
                    res.render('captains-edit', {errors: errors, team: team, captain: user});
                }
            });
        } else {
            let query = {_id: req.params.id};

            usersModel.findOne(query, (err, user) => {
                if (err) {
                    req.flash('danger', 'Failed to find the captain to edit');
                    console.log(err);
                } else {
                    user.name = name;
                    user.username = username;
                    user.mobile = mobile;
                    user.captainof = captainof;
        
                    usersModel.updateOne(query, user, err => {
                        if (err) {
                            req.flash('danger', 'Failed to update the captain');
                            console.log(err);
                            return;
                        } else {
                            req.flash('success', 'Successfully updated the captain');
                            res.redirect('/captains');
                        }
                    });
                }
            });
        }
    } else {
        req.flash('danger', 'Insufficient privileges');
        res.redirect('/');
    }
});


//
// Captains Delete Process
//
captains.delete('/:id', ensureAuthenticated, (req, res) => {
    console.log("GOTHERE");
    if (req.user.captainof == 'admin') {
        let query = {_id: req.params.id};

        usersModel.deleteOne(query, err => {
            if (err) {
                req.flash('danger', 'Failed to delete the captain');
                console.log(err);
                return;
            } else {
                req.flash('success', 'Successfully deleted the captain');
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


module.exports = captains