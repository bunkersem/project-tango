const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (Object.keys(req.query).length < 1) {
    // Display the welcome page when the user requests the website's root page without any query-args,
    res.locals.welcome = true; 
  };
  next();
})


router.get('/', function(req, res, next) {
  res.locals.title = "SpelletjesKast.nl";
  res.locals.catagory = catagoryFromId(req.app.locals.catagories, req.query.catagory);
  console.log("page catagorie: " + res.locals.catagory);
  res.locals.limit = req.query.limit || 12;
  res.locals.offset = req.query.offset || 0;
  res.locals.search = req.query.q || '*';
  res.locals.sortby = req.query.sortby || 'title';
  if (res.locals.sortby !== 'catagory' && res.locals.sortby !== 'created' && res.locals.sortby !== 'title')
  {
      // This sorting method does not exist.
      res.locals.sortby = 'title'; 
  }
  res.locals.title = "Home";
  res.render('index');
});

module.exports = router;

function catagoryFromId(catagories, id){
  // parse id into an int because it was part of a query.
  id = parseInt(id) 
  if (id === undefined){
    return '*';
  }
  else {
    return (catagories.filter(x => x.id === id) || [])[0];
  }
}