// Load config module to extract env, service name, version, and log level
const config = require('./config');
const serviceEnv = config.get("meta.env")
var logLevel = config.get("log.level");
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
    // Create base log line with common info
    var logLine = `${info.timestamp} ${info.level}: ${info.message}`;

    // Add metadata keys to log-line if available
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
      logLine += ` ${metaString}`;
    }

    // Add trace information to log-line if available
    if (info.trace_id) {
      logLine += ` trace_id=${info.trace_id}`;
    }
    if (info.span_id) {
      logLine += ` span_id=${info.span_id}`;
    }
    if (info.trace_flags) {
      logLine += ` trace_flags=${info.trace_flags}`;
    }

    // Output log-line
    return logLine;
  })
);
if (serviceEnv != "local") {
  logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  );
  
}

// Create the app logger and write logs to console
var logger = winston.createLogger({
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: logFormat
    })
  ]
});

module.exports = logger
