var express = require('express');
var router = express.Router();
var metrics = require('../metrics').customMetrics;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET hit endpoint */
router.get('/hit', function(req, res, net) {
    metrics.hitCounter.inc(1);
    res.render('index', { title: 'Express' });
});

module.exports = router;
