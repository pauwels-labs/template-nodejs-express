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
        return `${info.timestamp} ${info.level}: ${info.message}`;
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
