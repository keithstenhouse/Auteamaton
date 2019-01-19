const express = require('express');
const matchesModel = require('../models/matches');
const squadplayersModel = require('../models/squadplayers');
const playersModel = require('../models/players');
const messaging = express.Router();

const Nexmo = require('nexmo');
const nexmoConfig = require('../config/nexmo');

const dateformat = require('dateformat');

//
// Nexmo
//
const nexmo = new Nexmo({
    apiKey: nexmoConfig.apiKey,
    apiSecret: nexmoConfig.apiSecret
}, {debug: false});


//
// Messaging route
//
messaging.get('/', ensureAuthenticated, (req, res) => {
    if (req.user) {
        today = new Date();
        rawdate = dateformat(today, 'yyyy-mm-dd');
        
        let team = req.user.captainof;
        let matchquery = {
            team: team,
            rawdate: {
                "$gte": rawdate
            }
        };
    
        matchesModel.findOne(matchquery, (err, match) => {
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

            let squadplayerquery = { team: team };

            squadplayersModel.find(squadplayerquery, (err, squadplayers) => {
                if (err) {
                    throw err;
                }
        
                res.render('messaging', {match: match, squadplayers: squadplayers});
            }).sort('name');
        }).sort('datetime');
    } else {
        res.render('login')
    }
});


//
// Messaging Request Squad Availability Route
//
messaging.get('/request_squad_availability', ensureAuthenticated, (req, res) => {
    if (req.user) {
        today = new Date();
        rawdate = dateformat(today, 'yyyy-mm-dd');

        let team = req.user.captainof;
        let matchquery = {
            team: team,
            rawdate: {
                "$gte": rawdate
            }
        };

        matchesModel.findOne(matchquery, (err, match) => {
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

            let squadplayerquery = { team: team };

            squadplayersModel.find(squadplayerquery, (err, squadplayers) => {
                if (err) {
                    throw err;
                }

                let squadplayerquery = { team: team };

                squadplayersModel.find(squadplayerquery, (err, squadplayers) => {
                    if (err) {
                        throw err;
                    }

                    for (let i in squadplayers) {
                        let playersquery = {name: squadplayers[i].player};

                        playersModel.findOne(playersquery, (err, player) => {
                            if (err) {
                                throw err;
                            }

                            const from = req.user.mobile;
                            const to = player.mobile;
                            const msg = `Hi ${player.greeting}, this message is being sent to all squad players in the ${req.user.captainof} team requesting your availability for the ` + 
                                        `${match.venue} match on ${match.day} ${match.date} at ${match.time} against ${match.opposition}.  Please reply to this message and ` +
                                        `I will confirm your selection when a team has been raised.  Thanks.`;

                            console.log(`Sending SMS from '${from}' to '${to}': body '${msg}'`)

                            // nexmo.message.sendSms(from, to, msg, { type: 'unicode' }, (err, responseData) => {
                            //     if (err) {
                            //         console.log("SMS Error: " + err);
                            //     } else {
                            //         console.log("SMS Success: " + responseData);
                            //         console.log("SMS Success: Remaining Balance - " + responseData.messages[0]["remaining-balance"]);
                            //     }
                            // });

                            // Store recipients in a DB so they don't receive multiple messages?
                        });
                    }
                });

                req.flash('success', 'SMS messages have been sent to the ' + req.user.captainof + ' squad to request player availability, replies will go direct to your mobile.');
                res.redirect('/');
            }).sort('name');
        }).sort('datetime');
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


module.exports = messaging
