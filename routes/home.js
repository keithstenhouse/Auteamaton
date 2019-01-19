const express = require('express');
const matchesModel = require('../models/matches');
const home = express.Router();

const dateformat = require('dateformat');


//
// Home route
//
home.get('/', (req, res) => {
    if (req.user) {
        if (req.user.captainof == 'admin') {
            res.render('home-admin')
        } else {
            today = new Date();
            rawdate = dateformat(today, 'yyyy-mm-dd');
            
            let team = req.user.captainof;
            let query = { team: team, rawdate: {"$gte": rawdate}};

            matchesModel.findOne(query, (err, match) => {
                if (err) {
                    throw err;
                }

                if (match == undefined) {
                    match = {};
                    
                    match.team = team
                    match.day = ''
                    match.date = ''
                    match.time = ''
                    match.venue = ''
                    match.opposition = ''
                }
        
                res.render('home', {match: match});
            }).sort('datetime');
        }
    } else {
        res.render('login')
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


module.exports = home