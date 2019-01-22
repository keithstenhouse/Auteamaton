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
    
        matchesModel.findOne(matchquery).sort('datetime').exec().then(match => {
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

            squadplayersModel.find(squadplayerquery).sort('player').exec().then(squadplayers => {
                let messagesquery = { team: team, date: match.date, time: match.time };
                messagesModel.find(messagesquery).exec().then(messages => {
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
                }).catch(err => {
                    throw err;
                });
            }).catch(err => {
                throw err;
            });
        }).catch(err => {
            throw err;
        });
    } else {
        res.render('login')
    }
});


//
// Messaging Request Squad Availability Route
//

async function getMatch(team, rawdate) {
    let matchquery = {
        team: team,
        rawdate: {
            "$gte": rawdate
        }
    };

    return new Promise((resolve, reject) => {
        matchesModel.findOne(matchquery).sort('rawdate').exec().then(match => {
            if (match == undefined) {
                match = {};

                match.team = team
                match.day = ''
                match.date = ''
                match.time = ''
                match.venue = ''
                match.opposition = ''
            }

            resolve(match);
        }).catch(err => {
            reject(err);
        });
    });
}

async function getSquadPlayers(team) {
    let squadplayerquery = { team: team };

    return new Promise((resolve, reject) => {
        squadplayersModel.find(squadplayerquery).sort('player').exec().then(squadplayers => {
            resolve(squadplayers);
        }).catch(err => {
            reject(err);
        });
    });
}

async function getPlayer(player) {
    let playersquery = {name: player};

    return new Promise((resolve, reject) => {
        playersModel.findOne(playersquery).exec().then(player => {
            resolve(player);
        }).catch(err => {
            reject(err);
        });
    });
}

async function getMessage(team, match, player) {
    let messagesquery = { team: team, date: match.date, time: match.time, player: player.name };

    return new Promise((resolve, reject) => {
        messagesModel.findOne(messagesquery).exec().then(message => {
            resolve(message);
        }).catch(err => {
            reject(err);
        });
    });
}

messaging.get('/request_squad_availability', ensureAuthenticated, async (req, res) => {
    if (req.user) {
        today = new Date();
        rawdate = dateformat(today, 'yyyy-mm-dd');

        let match, squadplayers, player, message;

        let team = req.user.captainof;

        match = await getMatch(team, rawdate);

        squadplayers = await getSquadPlayers(team);

        if (match == undefined) {
            req.flash('danger', 'There are no upcoming ' + req.user.captainof + ' matches scheduled.  Please update the Matches section.');
        } else if (squadplayers.length <= 0) {
            req.flash('danger', 'There are no ' + req.user.captainof + ' squad players.  Please update the Squad Players section.');
        } else {
            req.flash('success', 'SMS messages are being sent to the ' + req.user.captainof + ' squad to request player availability, replies will go direct to your mobile.');
        }

        for (let i in squadplayers) {

            player = await getPlayer(squadplayers[i].player);

            message = await getMessage(team, match, player);

            if (message == undefined) {
                const from = req.user.mobile;
                const to = player.mobile;
                const venue = match.venue.toLowerCase();

                const msg = `${player.greeting}, are you available for a ${req.user.captainof} ${venue} match on ${match.day} ${match.date} at ${match.time} vs ` +
                            `${match.opposition}.  I'll confirm selection ASAP.`

                req.flash('success', 'SMS message has been sent to ' + player.name);

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
                    console.log('Failed to save the message in the messages model');
                });
            } else {
                req.flash('danger', 'A previous SMS message has been sent to ' + player.name + ' - ignoring!');
            }
        }
        
        res.redirect('/messaging');
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
