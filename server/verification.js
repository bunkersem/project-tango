const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const models = require('./models');
const User = models.User;
const ProviderUser = models.ProviderUser;
const request = require('request');

const accountsDataservice = require('./dataservice/accounts');
const config = require('./config.json');

exports.isAuthenticated = function isAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    else {
        res.redirect('/auth/login');
    }
}

exports.isAdmin = function isAdmin(req, res, next) {
    if (config.mailer.adminMails
        .some(mail => mail.trim() === req.user.email && req.user.email.trim()))
        return next();
    else {
        res.locals.message = 'Er is iets misgegaan.';
        res.locals.error = 'U heeft geen administrator rechten';
        res.render('error');
    }
}



exports.verifyReCaptcha = function verifyReCaptcha(gRecaptchaResponse, remoteIp = null) {
  var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  var body = {
    secret: config.captcha.secretKey,
    response: gRecaptchaResponse
  }
  if (remoteIp)
    body.remoteip = remoteIp;

  var options = {
    url: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    headers: headers,
    form: body
  }

  return new Promise((res, rej) => {
    request(options, function (error, response, body) {
      if (error) {
        console.error(body);
        return rej(error);
      }
      return res(JSON.parse(body));
    })
  })
}

const facebookAuth = 
    process.env.NODE_ENV === 'DEVELOPMENT' 
        ? config.authentication.facebookAuthLocal 
        : config.authentication.facebookAuth
const twitterAuth = 
    process.env.NODE_ENV === 'DEVELOPMENT'
        ? config.authentication.twitterAuthLocal
        : config.authentication.twitterAuth;

exports.passportVeref = function passportVeref(){

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        accountsDataservice.getUser(id).then((result, err) => {
            done(err, result)
        }).catch(error => {
            throw error;
        });
    });

    passport.use(new GoogleStrategy(config.authentication.googleAuth, 
    function(req, accessToken, refreshToken, profile, done) {
        getUser('google', accessToken, refreshToken, profile, done);
    }));

    passport.use(new FacebookStrategy(facebookAuth,
    function(req, accessToken, refreshToken, profile, done) {
        getUser('facebook', accessToken, refreshToken, profile, done);
    }));

    passport.use(new TwitterStrategy(twitterAuth,
    function(req, accessToken, refreshToken, profile, done) {
        getUser('twitter', accessToken, refreshToken, profile, done);
    }));
}

function getUser(provider, accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
        accountsDataservice.getUserViaProvider(provider, profile.id)
        .then(result => {
            if (result) {
                return done(null, result);
            } else {
                if (!isVal(profile.emails) || !isVal(profile.emails[0] || !isVal(profile.emails[0].value)))
                {   // This user lacks a valid email adress. Abort the process with an error.
                    return done({status: 500, message: `Je ${provider} account heeft geen geldig/geverifieerd E-Mail adres.\n Mischien ben je, tijdens het aanmaken van je twitter account, je email te bevestigen.`});
                }
                var newUser = new ProviderUser(
                    profile.id,
                    accessToken,
                    profile.emails[0].value,
                    profile.displayName
                ); // Its not a problemen the "newUser".id is undefined,
                // becuase you will probably need the newUser.proverId,
                // which is equal to profile.id.

                accountsDataservice.addUser(provider, newUser)
                .then(user => {
                    return done(null, user); //The user
                })
                .catch(err => {
                    console.error(err)
                    return done(err);
                })
                console.log('profile: ', profile);
            }
        })
        .catch(err => {
            console.error(err)
            return done(err);
        });
    });
}

function isVal(val) {
    return val !== undefined && val !== null;
}