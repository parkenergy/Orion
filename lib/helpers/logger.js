var config = require("../../config.js"),
  expressLogger = require('express-bunyan-logger'),
  bunyan = require('bunyan');

var options = {
  name: "Orion",
  streams: [{
    stream: process.stdout,
    level: config.logLevel
  }]
};

var logger = bunyan.createLogger(options);

logger.middleware = function(app) {
  app.use(expressLogger(options));
};

module.exports = logger;
