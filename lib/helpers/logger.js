var config = require("../../config.js"),
  expressLogger = require('express-bunyan-logger'),
  bunyan = require('bunyan');

var logger = bunyan.createLogger(config.logging);

logger.middleware = function (app) {
  app.use(expressLogger(options));
};

module.exports = logger;
