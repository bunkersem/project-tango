const express = require('express');
const router = express.Router();

const config = require('../server/config.json');
const mailer = require('../server/mailer');

const { verifyReCaptcha } = require('../server/verification');

const request = require('request');

router.all('*', function (req, res, next) {
  res.locals.payment = config.payment;
  res.locals.contact = config.contact;
  next();
});

router.get('/privacy-policy', function (req, res, next) {
  res.locals.title = 'Informatie';
  res.render('about');
});

router.get('/about', function (req, res, next) {
  res.locals.title = 'Informatie';
  res.render('about');
});

router.get('/contact', function (req, res, next) {
  res.locals.title = 'Contact';
  res.render('contact');
});

router.post('/contact/mail', function (req, res, next) {

  // contactName
  // contactEmail
  // contactSubject
  // contactMessage

  // Check honypot condition.
  if (req.body.potOfHoney !== '') {
    res.next({ status: 412 }, 'Kon de pagina niet opvragen.');
  }

  req.sanitizeBody('contactName').escape();
  req.sanitizeBody('contactSubject').escape();
  req.sanitizeBody('contactMessage').escape();

  req.checkBody('contactName', 'Je bent vergeten je naam in te vullen.').notEmpty();
  req.checkBody('contactEmail', 'Je bent vergeten je E-Mail adres in te vullen.').notEmpty();
  req.checkBody('contactSubject', 'Je moet een onderwerp voor je bericht in vullen.').notEmpty();
  req.checkBody('contactMessage', 'Je bericht bevat geen inhoud.').notEmpty();
  req.checkBody('g-recaptcha-response', 'reCAPTCHA niet correct.').notEmpty();
  req.checkBody('contactEmail', 'Het E-mail adres wat je hebt ingevuld is niet geldig.').isEmail();

  const errors = req.validationErrors() || [];
  if (errors.length > 0) {
    res.locals.errors = errors;
    res.render('contact');
    return;
  }

  verifyReCaptcha(req.body['g-recaptcha-response'], req.connection.remoteAddress)
  .then(result => {
    if (result.success === false) {
      return captchaFailed(error);
    }

    mailer.sendMail({
      from: req.body.contactEmail,
      to: config.contact.email,
      subject: req.body.contactSubject,
      html: mailer.renderMailBody('contactMessage', req.body)
    }, function (error, response) {
      if (error) {
        return captchaFailed(error);
      } 
      res.locals.title = 'Contact';
      res.locals.success = true;
      res.render('contact');
    });
  }).catch(err => {
    return captchaFailed(err);
  });

  function captchaFailed(error){
    console.error(error);
    errors.push({ msg: 'kon reCAPTCHA niet verifiëren.' });
    res.locals.errors = errors;
    res.render('contact');
  }
  
});

module.exports = router;


