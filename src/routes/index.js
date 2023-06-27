// Standard telemetry, logging, and config packages
const opentelemetry = require("@opentelemetry/api");
const { SemanticAttributes } = require("@opentelemetry/semantic-conventions");
const metrics = require('../metrics').customMetrics;
const logger = require('../logger');
const config = require('../config');

// Tracing setup
const serviceName = config.get("meta.name");
const tracer = opentelemetry.trace.getTracer(serviceName);

// Express packages
const express = require('express');
const router = express.Router();
const jwtDecode = require('jwt-decode');

// Simulates some random work
function doWork(max) {
  // This starts a new active span; all new spans created in the callback will
  // appear as children of this parent span
  return tracer.startActiveSpan("doWork", (span) => {
    // Set source code information attributes
    span.setAttribute(SemanticAttributes.CODE_FUNCTION, "doWork");
    span.setAttribute(SemanticAttributes.CODE_FILEPATH, __filename);

    // Example of a log at the beginning of the active span
    logger.info("Started doWork function");

    var sum = 0;
    for (let i = 0; i <= max; i += 1) {
      // This starts a new inactive span; it will be a child of the current
      // active span created above and a sibling to all the other inactive spans
      const subSpan = tracer.startSpan(`doWork:${i}`);

      // Example of a log in an inactive span
      logger.info(`Started loop ${i} in doWork`, {
        metadata: {
          sum: sum
        }
      });

      // Do the work and add span attributes
      subSpan.setAttribute("sumBefore", sum);
      sum += i;
      subSpan.setAttribute("sumAfter", sum);

      // Example of a log in an inactive span
      logger.info(`End loop ${i} in doWork`, {
        metadata: {
          sum: sum
        }
      });

      subSpan.end();
    }
    span.end();
    return sum;
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  const sum = doWork(20);

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
