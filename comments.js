// Create web server
// npm install express
// npm install body-parser
// npm install nodemon
// npm install ejs
// npm install mongoose
// npm install express-session
// npm install connect-flash
// npm install passport
// npm install passport-local
// npm install passport-local-mongoose

// 1. Load modules
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

// 2. Connect to MongoDB
mongoose.connect('mongodb://localhost/Comments');

// 3. Create a schema
var Schema = mongoose.Schema;
var UserDetail = new Schema({
    username: String,
    password: String
}, {
    collection: 'userInfo'
});
var UserDetails = mongoose.model('userInfo', UserDetail);

// 4. Create a web server
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 5. Passport
passport.use(new LocalStrategy(
    function(username, password, done) {
        process.nextTick(function() {
            UserDetails.findOne({ 'username': username },
                function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, { message: 'Unknown user' });
                    }
                    if (user.password != password) {
                        return done(null, false, { message: 'Invalid password' });
                    }
                    return done(null, user);
                });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserDetails.findById(id, function(err, user) {
        done(err, user);
    });
});

// 6. Route
app.get('/', function(req, res) {
    res.render('index', { message: req.flash('error') });
});

app.get('/register', function(req, res) {
    res.render('register', { message: req.flash('error') });
});

app.post('/register', function(req, res) {
    new