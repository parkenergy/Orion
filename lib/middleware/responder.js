'use strict';
var log = require('../helpers/logger');

function responder(req, res, next) {
  res.reject = function(err) {
    log.warn({stack: err.stack || null}, err.message || err);
    res.status(500).send(err.message || err);
  };

  res.resolve = function(results) {
    res.json(results);
  };

  next();
}

module.exports = function(app) {
  app.use(responder);
};
