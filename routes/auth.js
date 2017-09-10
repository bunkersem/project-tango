const express = require('express');
const passport = require('passport');
const { isAuthenticated } = require('../server/verification');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { successRedirect: '/auth/login/success', failureRedirect: '/auth/google/loginfailed' }));
router.get('/google/loginfailed', function(req, res, next){
    res.locals.title = 'Inloggen Mislukt';
    res.locals.error = {};
    res.locals.message = 'Inloggen via google is mislukt. Probeer facebook of twitter.'

    res.render('error');
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/auth/login/success', failureRedirect: '/auth/facebook/loginfailed' }));
router.get('/facebook/loginfailed', function(req, res, next){
    res.locals.title = 'Inloggen Mislukt';
    res.locals.error = {};
    res.locals.message = 'Inloggen via facebook is mislukt. Probeer google of twitter';
});

router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { successRedirect: '/auth/login/success', failureRedirect: '/auth/twitter/loginfailed' }));
router.get('/twitter/loginfailed', function(req, res, next){
    res.locals.title = 'Inloggen Mislukt';
    res.locals.error = {};
    res.locals.message = 'Inloggen via twitter is mislukt. Probeer google of facebook';
});

router.get('/login/success', function(req, res, next){
    res.redirect('/');
});

router.get('/login', function(req, res, next){
    res.locals.title = 'In Loggen';
    res.render('login');
});

router.get('/logout', isAuthenticated, function(req, res, next){
    req.logout();
    res.redirect('/auth/login')
});



module.exports = router;

