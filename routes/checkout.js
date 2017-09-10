const express = require('express');
const router = express.Router();

const models = require('../server/models');
const mailer = require('../server/mailer');
const crypto  = require('crypto');
const orderDataservice = require('../server/dataservice/orders');
const { isAuthenticated } = require('../server/verification');

router.get('/', isAuthenticated, function(req, res, next) {
  res.locals.title = "Bestellen"
  res.render('checkout');
});

router.post('/finish', isAuthenticated, function(req, res, next) {
  var {checkoutFName, checkoutMName, checkoutLName, checkoutBusinessName, 
  checkoutTelNum, checkoutEmailAdress, checkoutSreetname,
  checkoutResidenceName, checkoutPostalCode, checkoutProvince, checkoutStreetNumber, 
  checkoutCountry, checkoutRemarks, checkoutArticles} = req.body;
  try{
    checkoutArticles = JSON.parse(checkoutArticles);
  } catch(ex) {
    return next({status: 500, message:"Failed to parse article JSON object."});
  }

  // Sanitization
  req.sanitizeBody('checkoutRemarks').escape();

  req.sanitizeBody('checkoutFName').trim();
  req.sanitizeBody('checkoutFName').trim();
  req.sanitizeBody('checkoutLName').trim();
  req.sanitizeBody('checkoutTelNum').trim();
  req.sanitizeBody('checkoutEmailAdress').trim();
  req.sanitizeBody('checkoutResidenceName').trim();
  req.sanitizeBody('checkoutProvince').trim();
  req.sanitizeBody('checkoutPostalCode').trim();
  req.sanitizeBody('checkoutSreetname').trim();
  req.sanitizeBody('checkoutStreetNumber').trim();
  req.sanitizeBody('checkoutCountry').trim();

  // Validation
  req.checkBody('checkoutFName', 'Je bent vergeten je voornaam in te vullen.').notEmpty();
  req.checkBody('checkoutLName', 'Je bent vergeten je achternaam in te vullen.').notEmpty();
  req.checkBody('checkoutTelNum', 'Je bent vergeten je telefoon nummer in te vullen.').notEmpty();
  req.checkBody('checkoutEmailAdress', 'Je bent vergeten je email in te vullen.').notEmpty();
  req.checkBody('checkoutResidenceName', 'Je hebt je woonplaats niet ingevuld.').notEmpty();
  req.checkBody('checkoutProvince', 'Je bent vergeten het veld \'Provincie\' in te vullen.').notEmpty();
  req.checkBody('checkoutPostalCode', 'Je bent vergeten je postcode in te vullen.').notEmpty();
  req.checkBody('checkoutSreetname', 'Je bent vergeten je straatnaam in te vullen.').notEmpty();
  req.checkBody('checkoutStreetNumber', 'Je bent vergeten je huisnummer in te vullen.').notEmpty();
  req.checkBody('checkoutCountry', 'Je bent vergeten het veld \'Land\' in te vullen').notEmpty();


  req.checkBody('checkoutTelNum', 'Een telefoon nummer mag geen letters hebben.').isNumeric();
  req.checkBody('checkoutStreetNumber', 'Een straatnaam kan geen geen speciale characters hebben.').isAlphanumeric();
  req.checkBody('checkoutEmailAdress', 'Het e-mail adres wat je hebt ingevuld is niet geldig.').isEmail();
  req.checkBody('checkoutCountry', 'Het land wat u heeft geselecteerd is incorrect. Alleen Nederland en belgië zijn toegestaan.').enum(['BE', 'NL']);
  req.checkBody('checkoutPostalCode', 'Een postcode kan geen speciale characters hebben.').isAlphanumeric();

  var errors = req.validationErrors() || [];
  if (!Object.keys(checkoutArticles).length) {
    errors.push({param: 'checkout', msg: 'Er zijn geen artikelen toegevoegd aan het winkelmandje.'})
  }
  // If any of these articles contains an article with amount "0" do this:
  if (Object.keys(checkoutArticles).some(x => checkoutArticles[x].amount === 0)){
    errors.push({param: 'checkout', msg: 'Een artiekel mag niet "0" als hoeveelheid hebben'});
  }

  if (errors.length > 0){
    errors.forEach(err => {
      // If the array doesn't exist yet. Create it.
      res.locals[`${err.param}Errors`] = res.locals[`${err.param}Errors`] || [];
      // Add the error.
      res.locals[`${err.param}Errors`].push(` <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ${err.msg} `);
    })
    res.locals.title = "Bestellen"
    res.render('checkout')
  } else {
    // Checkout succesfull.
    const articleIds = Object.keys(checkoutArticles).map(x => checkoutArticles[x].id)
    const articlesCosts = global.articles.sum(x => parseFloat(x.price));
    const btw = articlesCosts * 0.21;
    const delivery = 5.00;
    const total = articlesCosts + btw + delivery;
    const hash = crypto.createHash('md5');
    const code = parseInt(hash.update(
      (new Date()).getTime() 
      + checkoutEmailAdress 
      + Math.floor(Math.random() * 10)
    ), 16);


    const order = new models.Order(undefined, articleIds, (new Date()).getTime(), req.user.id, 
        checkoutFName, checkoutMName, checkoutLName, checkoutBusinessName, checkoutTelNum, checkoutEmailAdress, checkoutSreetname, 
        checkoutResidenceName, checkoutProvince, checkoutPostalCode, checkoutStreetNumber, 
        checkoutCountry, checkoutRemarks, btw, delivery, articlesCosts, total);
    order.articles = global.articles.filter(art => articleIds.includes(art.id));


    // Render admin mail
    orderDataservice.addOrder(order)
    .then(result => {
        order.id = result[0] && result[0].id
        order.code = result[0] && result[0].code
        // After being permenantly added to the database send the admin order mail.
        mailer.sendOrderMail(mailer.renderMailBody('adminmail', order))
        mailer.sendOrderConfirmationClientMail(order);
        res.render('checkoutFinish', order);
     })
    .catch(err => { next(err) });
  }
});


module.exports = router;


/* 
[checkoutFName,
checkoutMName,
checkoutLName,
checkoutBusinessName,
checkoutTelNum,
checkoutEmailAdress,
checkoutSreetname,
checkoutResidenceName,
checkoutPostalCode,
checkoutStreetNumber,
checkoutCountry,
checkoutRemarks]
*/

// Get input fields from checkout form: (run in chrome)
// Object.keys($('#checkoutForm').get(0).elements).filter(x => isNaN(parseInt(x)) && x !== 'orderButton')