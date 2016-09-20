'use strict';
var log           = require('../helpers/logger'),
  AuthError       = require('../errors/auth'),
  ClientError     = require('../errors/client'),
  ValidationError = require('mongoose/lib/error/validation'),
  ServerError     = require('../errors/server');

function responder(req, res, next) {
  res.reject = function (err) {
    if(err instanceof AuthError) {

      log.warn({stack: err.stack || null, error: err.message || err, status: err.status}, "AuthError occurred");
      res.status(err.status).send(err.message || err);
    }
    else if(err instanceof ClientError) {
      log.warn({stack: err.stack || null, error: err.message || err, status: err.status}, "ClientError occurred");
      res.status(err.status).send(err.message || err);
    }
    else if(err instanceof ServerError) {
      log.error({stack: err.stack || null, error: err.message || err, status: err.status}, "ServerError occurred");
      res.status(err.status).send(err.message || err);
    }
    else if(err instanceof ValidationError) {
      log.warn({stack: err.stack || null, error: err.message || err, status: 400}, "ValidationError occurred");
      res.status(400).send(err.message || err);
    }
    else {
      log.error({stack: err.stack || null, error: err.message || err}, "Error occurred");
      res.status(500).send(err.message || err);
    }
  };
  res.resolve = function (results) {
    res.json(results);
  };
  //res.resolve = res.json;

  // Helper to respond wth downloadable string
  res.downloadable = function (fileName, type, str) {
    log.info({fileName: fileName, type: type}, "File download sent");
    res.set("Content-Disposition", 'attachment; filename=\"' + fileName + '\"');
    res.set("Content-Type", type);
    res.send(str);
  };

  next();
}

module.exports = function (app) {
  app.use(responder);
};
