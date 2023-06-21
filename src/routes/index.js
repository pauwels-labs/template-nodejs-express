var express = require('express');
var router = express.Router();
var metrics = require('../metrics').customMetrics;
var logger = require('../logger');
var jwtDecode = require('jwt-decode');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '/index' });
});

/* GET hit endpoint */
router.get('/hit', function(req, res, net) {
  metrics.hitCounter.inc(1);
  res.render('index', { title: '/hit' });
});

/* GET secure endpoint */
router.get('/secure', function(req, res, net) {
  const jwtToken = req.get('x-forwarded-id-token');
  logger.info('headers', {
    metadata: req.headers
  });
  if (!jwtToken) {
    return res.render('index', { title: '/index' });
  } else {
    try {
      var jwtDecoded = jwtDecode(jwtToken);
      logger.info('user info', {
        metadata: jwtDecoded
      });
      res.render('secure', { title: '/secure', user: `${jwtDecoded.given_name} ${jwtDecoded.family_name}` });
    } catch (err) {
      logger.error(err);
      return res.render('index', { title: '/index'});
    }
  }
});

module.exports = router;
