var express = require('express');
const articlesDataservice = require('../server/dataservice/articles');
const models = require('../server/models');
var router = express.Router();

router.get('/', function(req, res, next) {
  articlesDataservice.getAllArticles()
  .then(result => {
    res.json(result);
    global.articles = result;
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(err.status || 500);
  });
});

router.get('/article', function(req, res, next) {
  res.render('article');
});


module.exports = router;
