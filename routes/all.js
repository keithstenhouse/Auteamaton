const express = require('express');
const all = express.Router();

//
// All route
//
all.get('*', (req, res, next) => {
    // if there is a req.user object (Passport creates this object upon successful login) then store this user in the res.locals.user variable
    // Do this for all routes and then call the next route handler
    // We can refer to res.locals.user as "user" in layout.pug
    if (req.user) {
        if (req.user.captainof == 'admin') {
            res.locals.admin = true
        }
        res.locals.user = req.user || null;
    }
    next();
});


module.exports = all