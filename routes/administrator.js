const express = require('express');
const articlesDataservice = require('../server/dataservice/articles')
const models = require('../server/models')
const router = express.Router();

const { isAuthenticated, isAdmin } = require('../server/verification');
const { getCsvOrders } = require('../server/admin');

router.all('*', isAuthenticated, isAdmin, function(req, res, next) {
  res.locals.email = req.user.email;
  next();
});

router.get('/', function(req, res, next) {
  res.locals.title = 'Admin';
  res.locals.keywords = 'admin';
  res.locals.description = 'Admin page.'
  res.render('admin');
});

router.post('/upload', function(req, res, next) {
  console.log('received request!!!!!');
  console.log('data is', req.body);
  articlesDataservice.addArticle(
    new models.Article(
      req.body.name,
      req.body.title, 
      req.body.description, 
      JSON.parse(req.body.images),
      (new Date()).getTime(),
      req.body.catagory,
      req.body.imageName,
      undefined, //ID
      req.body.stock,
      parseFloat(req.body.price)
    )
  ).then(result => {
    console.log('Succesfully saved article to the database')
    res.json({message: 'Succes'});
  }).catch(err => {
    console.error('cannot upload: ', err)
    res.sendStatus(500)
  })
  
});

router.get('/orders-report', isAuthenticated, isAdmin, function(req, res, next) {
  getCsvOrders()
  .then(csvString => {
    res.setHeader('Content-type', "application/octet-stream");
    res.setHeader('Content-disposition', 'attachment; filename=orders-report.csv');
    res.send(csvString);
  })
  .catch(err => {
    err.status = 500;
    next(err);
  });
})

router.post('/edit', function(req, res, next) {
  console.log('received request!!!!!');
  console.log('data is', req.body);
  articlesDataservice.updateArticle(
    new models.Article(
      undefined,  // Name Will not be updated
      req.body.title,
      req.body.description,
      undefined, // Images Will not be updated
      undefined, // Creation Timestamp Will not be updated
      req.body.catagory,
      undefined, // Image Will not be updated
      req.body.id
    )
  ).then(result => {
    console.log('Succesfully updated article')
    res.json({message: 'Succes'});
  }).catch(err => {
    console.error(err)
    res.sendStatus(500)
  })
});

router.post('/delete', function(req, res, next) {
  console.log('received request!!!!!');
  console.log('data is', req.body);
  articlesDataservice.deleteArticle(
    new models.Article(
      req.body.name
    )
  ).then(result => {
    console.log('Succesfully deleted article')
    res.json({message: 'Succes'});
  }).catch(err => {
    console.error(err)
    res.sendStatus(500)
  })
});

module.exports = router;
