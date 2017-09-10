require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const validator = require('express-validator');
const pg = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const { passportVeref } = require('./server/verification');
const config = require('./server/config.json');
const mailer = require('./server/mailer');

require('./server/extensions');

const index = require('./routes/index');
const accounts = require('./routes/accounts');
const administrator = require('./routes/administrator');
const articles = require('./routes/articles');
const auth = require('./routes/auth');
const checkout = require('./routes/checkout');
const service = require('./routes/service');

const app = express();

pg.defaults.ssl = true;
// Setup postgres pool.
const pgConfig = {
    max: 20,
    idleTimoutMillis: 30000
};
var pool = new pg.Pool(pgConfig);
var pgDatabase = require('./server/repository/database');
pgDatabase.intialize(pool);


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('case sensitive routing', true);

require('./server/applocalsloader')(app);

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'media', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: { maxAge: 90 * 24 * 60 * 60 * 1000 } // 90 Days
}));
app.use(passport.initialize());
app.use(passport.session());
passportVeref();
//mailer.mount(app, passport);
app.use(validator([]));
app.use(fileUpload());
app.use(validator({
    customValidators: {
        enum: (input, options) => options.includes(input)
    }
}));

require('./server/tests')(); // Run tests; 
// Run get articles once because it will set the "global.articles variable".
require('./server/dataservice/articles').getAllArticles()
.then(res => global.articles = res)
.catch(err => { throw err });

console.log('debug: ', `"${process.env.DEBUG}"`);
if (process.env.DEBUG === 'proj-tango:*'){
    console.log('using debug mode');
    const livereload = require('express-livereload');
    livereload(app, {});
    app.locals.pretty = true;
}

app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});

app.use('/', index);
app.use('/', service)
app.use('/accounts', accounts);
app.use('/admin', administrator);
app.use('/articles', articles);
app.use('/auth', auth);
app.use('/checkout', checkout)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404;
    if (req.method === "GET"){
        next(err);
    } else {
        res.sendStatus(404);
    }
    
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    console.error(err);
    res.locals.message = process.env.NODE_ENV === 'DEVELOPMENT' ? err.message : 'Er is iets misgegaan.'
    res.locals.error = process.env.NODE_ENV === 'DEVELOPMENT' ? err : {}
    res.render('error')
})

module.exports = app