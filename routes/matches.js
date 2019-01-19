const express = require('express');
const matchesModel = require('../models/matches');
var matches = express.Router();

const dateformat = require('dateformat');


//
// Matches home page
//
matches.get('/', ensureAuthenticated, (req, res) => {
    let team = req.user.captainof;
    let query = { team: team };

    matchesModel.find(query, (err, matches) => {
        if (err) {
            throw err;
        }

        res.render('matches', {matches: matches});
    }).sort('datetime');
});


//
// Matches Add Form
//
matches.get('/add', ensureAuthenticated, (req, res) => {
    res.render('matches-add');
});

// Matches Add Process
matches.post('/add', ensureAuthenticated, (req, res) => {
    d = new Date(req.body.date);
    rawdate = dateformat(d, 'yyyy-mm-dd');

    const team = req.user.captainof;
    const day = dateformat(d, 'dddd');
    const date = dateformat(d, 'dS mmmm yyyy');
    const time = req.body.time;
    const venue = req.body.venue;
    const opposition = req.body.opposition;

    req.checkBody('date', 'Date is required').notEmpty();
    req.checkBody('time', 'Time is required').notEmpty();
    req.checkBody('venue', 'Venue is required').notEmpty();
    req.checkBody('opposition', 'Opposition is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('matches-add', {
            errors: errors
        });
    } else {
        let newMatch = new matchesModel({
            team: team,
            day: day,
            rawdate: rawdate,
            date: date,
            rawtime: req.body.time,
            time: time + 'hrs',
            venue: venue,
            opposition:opposition
        });

        newMatch.save(err => {
            if (err) {
                req.flash('danger', 'Failed to add the match (' + team + ' team already has a match on ' + day + ' ' + date +'), please try another');
                res.redirect('/matches/add');
            } else {
                req.flash('success', 'The match has been added to the ' + team + ' team fixture list');
                res.redirect('/matches');
            }
        });
    }
});


//
// Matches Edit Form
//
matches.get('/edit/:id', ensureAuthenticated, (req, res) => {
    let query = {_id: req.params.id};

    matchesModel.findOne(query, (err, match) => {
        if (err) {
            req.flash('danger', 'Failed to find the match to edit');
            console.log(err);
        } else {
            res.render('matches-edit', {match: match});
        }
    });
});

// Matches Edit Process
matches.post('/edit/:id', ensureAuthenticated, (req, res) => {
    // Form validation using expess-validator
    d = new Date(req.body.date);
    rawdate = dateformat(d, 'yyyy-mm-dd');

    const team = req.user.captainof;
    const day = dateformat(d, 'dddd');
    const date = dateformat(d, 'dS mmmm yyyy');
    const time = req.body.time;
    const venue = req.body.venue;
    const opposition = req.body.opposition;

    req.checkBody('date', 'Date is required').notEmpty();
    req.checkBody('time', 'Time is required').notEmpty();
    req.checkBody('venue', 'Venue is required').notEmpty();
    req.checkBody('opposition', 'Opposition is required').notEmpty();

    // Get Validation Errors
    let errors = req.validationErrors();

    if (errors) {
        let query = {_id: req.params.id};

        matchesModel.findOne(query, (err, match) => {
            if (err) {
                req.flash('danger', 'Failed to find the match to edit');
                console.log(err);
            } else {
                res.render('matches-edit', {match: match, errors: errors});
            }
        });
    } else {
        let match = {
            team: team,
            day: day,
            rawdate: rawdate,
            date: date,
            rawtime: req.body.time,
            time: time + 'hrs',
            venue: venue,
            opposition:opposition
        };

        let query = {_id: req.params.id};

        matchesModel.updateOne(query, match, err => {
            if (err) {
                req.flash('danger', 'Failed to update the match');
                console.log(err);
                return;
            } else {
                req.flash('success', 'Successfully updated the match');
                res.redirect('/matches');
            }
        });
    }
});


//
// Matches Delete Process
//
matches.delete('/:id', ensureAuthenticated, (req, res) => {
    let query = {_id: req.params.id};

    matchesModel.deleteOne(query, err => {
        if (err) {
            req.flash('danger', 'Failed to delete the match');
            console.log(err);
            return;
        } else {
            req.flash('success', 'Successfully deleted the match');
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


module.exports = matches