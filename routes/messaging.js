const express = require('express');
const matchesModel = require('../models/matches');
const squadplayersModel = require('../models/squadplayers');
const playersModel = require('../models/players');
const messagesModel = require('../models/messages')
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

                let messagesquery = { team: team, date: match.date, time: match.time };
                messagesModel.find(messagesquery, (err, messages) => {
                    if (err) {
                        throw err;
                    }

                    if (messages.length > 0) {
                        for (let i in messages) {
                            for (let j in squadplayers) {
                                if (messages[i].player === squadplayers[j].player) {
                                    squadplayers[j].datesent = messages[i].datesent
                                    squadplayers[j].timesent = messages[i].timesent
                                }
                            }
                        }
                    }
                    
                    res.render('messaging', {match: match, squadplayers: squadplayers});
                });
            }).sort('player');
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

                for (let i in squadplayers) {
                    let playersquery = {name: squadplayers[i].player};

                    playersModel.findOne(playersquery, (err, player) => {
                        if (err) {
                            throw err;
                        }

                        // Check if we have sent this message to this squad player already
                        let messagesquery = { team: team, date: match.date, time: match.time, player: player.name };
                        messagesModel.findOne(messagesquery, (err, message) => {
                            if (err) {
                                throw err;
                            }

                            if (message == undefined) {
                                const from = req.user.mobile;
                                const to = player.mobile;
                                const venue = match.venue.toLowerCase();

                                const msg = `${player.greeting}, are you available for a ${req.user.captainof} ${venue} match on ${match.day} ${match.date} at ${match.time} vs ` +
                                            `${match.opposition}.  I'll confirm selection ASAP.`

                                // console.log(`Sending SMS from '${from}' to '${to}': body '${msg}'`)

                                // nexmo.message.sendSms(from, to, msg, { type: 'unicode' }, (err, responseData) => {
                                //     if (err) {
                                //         console.log("SMS Error: " + err);
                                //     } else {
                                //         console.log("SMS Success: " + responseData);
                                //         console.log("SMS Success: Remaining Balance - " + responseData.messages[0]["remaining-balance"]);
                                //     }
                                // });

                                const datesent = dateformat(today, 'dS mmmm yyyy');
                                const timesent = dateformat(today, 'HH:MM') + 'hrs';

                                // Store recipients in a DB so they don't receive multiple messages?
                                let newMessage = new messagesModel({
                                    team: req.user.captainof,
                                    date: match.date,
                                    time: match.time,
                                    player: player.name,
                                    datesent: datesent,
                                    timesent: timesent
                                });
                        
                                newMessage.save(err => {
                                    if (err) {
                                        console.log('Failed to save the message in the messages model');
                                    }
                                });
                            }
                        });
                    });
                }
            }).sort('player');

            req.flash('success', 'SMS messages have been sent to the ' + req.user.captainof + ' squad to request player availability, replies will go direct to your mobile.');
            res.redirect('/');
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
