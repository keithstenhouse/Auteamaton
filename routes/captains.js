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
        teamsModel.find({}).sort('name').exec().then(teams => {
            usersModel.find({}).sort('captainof').exec().then(users => {
                res.render('captains', {teams: teams, captains: users});
            }).catch(err => {
                throw err;
            });
        }).catch(err => {
            throw err;
        });
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
        req.checkBody('name').trim().notEmpty().withMessage('Name is required');
        req.checkBody('username').trim().notEmpty().withMessage('Username is required');
        req.checkBody('mobile').trim().notEmpty().withMessage('Mobile is required');
        req.checkBody('captainof').trim().notEmpty().withMessage('Captain of Which Team is required');
        req.checkBody('password').trim().notEmpty().withMessage('Password is required');
        req.checkBody('password2').trim().equals(req.body.password).withMessage('Passwords much match');

        regex = /[^0123456789]/g
        req.body.mobile = req.body.mobile.replace(regex, '');
        req.checkBody('mobile').matches(/^447[0-9]+$/).withMessage('Must be a mobile phone number starting "447"');

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
                name: req.body.name,
                username: req.body.username,
                mobile: req.body.mobile,
                captainof: req.body.captainof,
                password: req.body.password
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
                            req.flash('danger', 'The username "' + req.body.username + '" is already taken, please try another');
                            res.redirect('/captains/add');
                        } else {
                            req.flash('success', req.body.username + ' has now been registered and can log in');
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
        req.checkBody('name').trim().notEmpty().withMessage('Name is required');
        req.checkBody('username').trim().notEmpty().withMessage('Username is required');
        req.checkBody('mobile').trim().notEmpty().withMessage('Mobile is required');
        req.checkBody('captainof').trim().notEmpty().withMessage('Captain of Which Team is required');

        regex = /[^0123456789]/g
        req.body.mobile = req.body.mobile.replace(regex, '');
        req.checkBody('mobile').matches(/^447[0-9]+$/).withMessage('Must be a mobile phone number starting "447"');

        // Get Validation Errors
        let errors = req.validationErrors();

        if (errors) {
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
                        res.render('captains-edit', {errors: errors, teams: teams, captain: user});
                    }
                });
            });
        } else {
            let query = {_id: req.params.id};

            usersModel.findOne(query, (err, user) => {
                if (err) {
                    req.flash('danger', 'Failed to find the captain to edit');
                    console.log(err);
                } else {
                    user.name = req.body.name;
                    user.username = req.body.username;
                    user.mobile = req.body.mobile;
                    user.captainof = req.body.captainof;
        
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