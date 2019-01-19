const express = require('express');
const passport = require('passport');
var users = express.Router();


//
// Login Form
//
users.get('/login', (req, res) => {
    res.render('login');
});

// Login Process
users.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: true,
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


//
// Logout
//
users.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
})


module.exports = users