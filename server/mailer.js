/// <reference path="./mailer.d.ts" />
'use strict';
const pug = require('pug');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('./config.json');
const adminMails = config.mailer.adminMails;
const path = require('path');
const fs = require('fs');
const inlineCss = require('nodemailer-juice');

var templateFunctions = {};

// Setup templates.
fs.readdirSync(path.join(__dirname, 'mail-templates')).forEach(file => {
    if (path.extname(file) !== '.pug') return;
    const fileName = path.basename(file).split('.')[0];
    templateFunctions[fileName] 
        = pug.compileFile(
        path.join(__dirname, 'mail-templates', file), 
        { debug: false }
    );
});


var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'XOAuth2',
        user: config.mailer.google.adress,
        pass: config.mailer.google.password,
        clientId: config.authentication.googleAuth.clientID,
        clientSecret: config.authentication.googleAuth.clientSecret,
        refreshToken: config.mailer.google.refreshToken,
        accessToken: config.mailer.google.accessToken,
        timeout: 3600 - Date.now()
        
    }
});
smtpTransport.use('compile', inlineCss());

exports.sendMail = sendMail
function sendMail(mailOptions, cb){
    smtpTransport.sendMail(mailOptions, cb || function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log(response)
            response.redirect('/');
        }
    });
}

exports.sendOrderMail = sendOrderMail
function sendOrderMail(html){
    sendMail({
        from: config.mailer.google.adress,
        to: config.mailer.adminMails.join(','),
        subject: 'Nieuwe Bestelling',
        html: html
    })
}

exports.sendOrderConfirmationClientMail = sendOrderConfirmationClientMail
function sendOrderConfirmationClientMail(locals){
    locals.contactTel = config.contact.tel;
    locals.contactEmail = config.contact.email;
    locals.iban = config.payment.iban;

    sendMail({
        from: config.mailer.google.adress,
        to: locals.email,
        subject: 'Bevestiging Bestelling',
        html: renderMailBody('orderConfirmation', locals)
    });
}

const renderMailBody = (fileToRender, locals) => templateFunctions[fileToRender](locals)
exports.renderMailBody = renderMailBody;



// passport.use('google-imap', new GoogleStrategy(config.authentication.googleAuth, 
//     function(accesToken, refreshToken, profile, done){
//     console.log('data!', accesToken, refreshToken, profile);
//     done(null, {
//         accesToken: accesToken,
//         refreshToken: refreshToken,
//         profile: profile
//     });
// }));


// exports.mount = function(app) {
//     app.get('/add-imap/:adress?', function(req, res, next){
//         passport.authorize('google-imap', {
//             scope: [
//                 'https://mail.google.com/',
//                 'https://www.googleapis.com/auth/userinfo.email'
                
//             ],
//             callbackURL: '/add-imap',
//             accessType: 'offline',
//             approvalPrompt: 'force',
//             loginHint: req.params.address
//         })(req, res, function() {
//             res.send(req.user);
//         })
//     })
// }