//
// Imports
//
const express = require('express');
const session = require('express-session');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const appConfig = require('./config/app');
const dbConfig = require('./config/database');
require('./config/passport')(passport); // Slightly different wa of setting up the passport configuration (Module.exports is exporting a function, rather than an object)

const all = require('./routes/all');
const home = require('./routes/home');
const users = require('./routes/users');
const captains = require('./routes/captains');
const teams = require('./routes/teams');
const matches = require('./routes/matches');
const squadplayers = require('./routes/squadplayers');
const players = require('./routes/players');
const messaging = require('./routes/messaging');


//
// Init app
//
const app = express();


//
// MongoDB / Mongoose connection
//
mongoose.connect(dbConfig.service + '://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.name, {useNewUrlParser: true});
const db = mongoose.connection;

// Confirm DB connection
db.once('open', () => {
    console.log('Connected to ' + dbConfig.service.toUpperCase() + ': ' + dbConfig.name + ' on ' + dbConfig.host + ':' + dbConfig.port);
});

// Report DB errors
db.on('error', err => {
    console.log(err);
});


//
// Load View Engine
//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//
// Body Parser Middleware
//

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// Parse application/json
app.use(bodyParser.json());


//
// Set Public Folder
//
app.use(express.static(path.join(__dirname, 'public')));


//
// Express Session Middleware
//
app.use(session({
    secret: dbConfig.secret,
    resave: false,
    saveUninitialized: true
}));


//
// Express Messages Middleware
//
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


//
// Express Validator Middleware
//
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.');
        var root = namespace.shift();
        var formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


//
// Passport Middleware
//
app.use(passport.initialize());
app.use(passport.session());


//
// Routing
//

// All routing
app.use('/', all);

// Home routing
app.use('/', home);

// Users routing
app.use('/users', users);

// Captains routing
app.use('/captains', captains);

// Teams routing
app.use('/teams', teams);

// Matches routing
app.use('/matches', matches);

// Squad routing
app.use('/squadplayers', squadplayers);

// Players routing
app.use('/players', players);

// Messaging routing
app.use('/messaging', messaging);


//
// Start Server (HTTPS)
//
const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl/cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'ssl/privkey.pem'))
}

https.createServer(httpsOptions, app).listen(appConfig.portHttps, () => {
     console.log(`HTTPS Server started on port: ${appConfig.portHttps}...`);
});


//
// Start Server (HTTP)
//
http.createServer((req, res) => {
    console.log('HTTP Server started on port: ' + appConfig.portHttp + '...');
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(appConfig.portHttp);