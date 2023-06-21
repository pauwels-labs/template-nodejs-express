// Load config module to extract env, service name, and log level
var config = require('./config');
const env = config.get("env");
const serviceName = config.get("name");
var logLevel = config.get("log:level");
if (!logLevel) {
  logLevel = "info";
}

// Load Winston module and set the log format based on whether
// this is running in an environment or locally
var winston = require('winston');
var logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const metaKeys = info.metadata ? Object.keys(info.metadata) : [];
    if (metaKeys.length > 0) {
      var metaString = "(";
      for (i = 0; i < metaKeys.length; ++i) {
        if (i == metaKeys.length - 1) {
          metaString += `${metaKeys[i]}=${info.metadata[metaKeys[i]]})`;
        } else {
          metaString += `${metaKeys[i]}=${info.metadata[metaKeys[i]]}, `;
        }
      }
      return `${info.timestamp} ${info.level}: ${info.message} ${metaString} `;
    } else {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    }
  })
);
if (env != "local") {
  logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  );
  
}

// Create the app logger and write logs to console
var logger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    env: env,
    service: serviceName
  },
  transports: [
    new winston.transports.Console({
      format: logFormat
    })
  ]
});

module.exports = logger
