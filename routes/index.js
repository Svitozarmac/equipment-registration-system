const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect("/equipment"); // redirect this to the new (index) home page that we have created at the path '/equipment'.
});

// About page
router.get('/about', function(req, res, next) {
  res.redirect('/equipment/about');
});

// Help page
router.get('/help', function(req, res, next) {
  res.redirect("/equipment/help");
});



module.exports = router;
