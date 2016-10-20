var config = require("../../config.js"),
  bunyan = require('bunyan');

var logger = bunyan.createLogger(config.logging);

// Reusable prototype function for custom error types to log the errors.
logger.protoLogger = function () {
  logger[this.level]({stack: this.stack, error: this.message}, this.title);
};

module.exports = logger;
