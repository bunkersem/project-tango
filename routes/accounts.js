var express = require('express');
var router = express.Router();
const accountsDataservice = require('../server/dataservice/accounts.js');
const ordersDataservice = require('../server/dataservice/orders');
const models = require('../server/models.js');
const { isAuthenticated } = require('../server/verification');

const validUsername = /[A-Za-z0-9]{3,20}/;

router.get('/registration', function(req, res, next) {
  res.locals.title = "Registration"
  res.render('registration')
});

router.post('/registration/complete', function(req, res, next) {
    
    req.checkBody('username', 'Gebruikernaam veld kan niet leeg zijn.').notEmpty();
    req.checkBody('username', 'Gebruikersnaam moet tussen de 4-20 characters lang zijn.').len(4,20);
    req.checkBody('email', 'De ingevulde email is incorrect.').isEmail();
    req.checkBody('email', 'Email adress moet tussen de 4-254 characters lang zijn').len(4, 254);
    req.checkBody('password', 'Password moet tussen de 4-100 characters lang zijn.').len(8,200);
    
    
    const errors = req.validationErrors();
    
    if (errors){
        console.log(`errors: ${JSON.stringify(errors, null, 2)}`);
        res.locals.errors = errors;
        res.locals.title = "Validatie Fout";
        res.render('registration')
    }

    const {username, email, password} = req.body;
    accountsDataservice.addUser(
        new models.User(username, email, password))
    .then((result, rej) => {
        res.locals.title = "Succesvolle Registratie"
        console.log('succesfull registration')
        res.redirect('/')
    })
    .catch(err => {
        next(err)
    })
});

router.get('/orders', isAuthenticated, function(req, res, next) {
    console.log(req.user.id);
    ordersDataservice.getOrders(req.user.id)
    .then(orders => {
        res.locals.title = 'Uw Bestellingen';
        res.locals.orders = orders;
        res.render('orders');
    })
    .catch(err => {
        next(err)
    })
});

module.exports = router;
