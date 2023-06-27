// Load service name to prefix custom metrics
const config = require('./config')
const serviceName = config.get("meta.name");
const serviceNameSanitized = serviceName.replaceAll('-', '_').toLowerCase();

// Load prometheus client and define custom metrics
const client = require('prom-client');
const hitCounter = new client.Counter({
  name: serviceNameSanitized + "_endpoint_hit_total",
  help: "Accumulates the number of times the /hit endpoint has been hit"
});

module.exports = {
  client,
  customMetrics: {
    hitCounter
  }
}
