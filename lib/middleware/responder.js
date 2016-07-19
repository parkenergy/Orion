'use strict';
var log = require('../helpers/logger');

function responder(req, res, next) {
  res.reject = function (err) {
    log.warn({stack: err.stack || null, error: err.message || err}, "Error occured, sending 500 status");
    res.status(500).send(err.message || err);
  };

  res.resolve = function (results) {
    res.json(results);
  };

  next();
}

module.exports = function (app) {
  app.use(responder);
};
