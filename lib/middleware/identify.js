'use strict';
const User    = require('../models/user'),
  log         = require('../helpers/logger'),
  AuthError   = require('../errors/auth');


const identify = (req, res, next) => {
  const token = req.get('Authorization');
  if(!token) {
    req.identity = null;
    next();
  }
  else {
    User.identify(token)
      .then(function (user) {
        if(! user) {
          const err = new AuthError("Failed to identify!");
          err.log();
          return err.reject(res);
        }
        req.identity = user;
        res.json(user);
        next();
      })
      .catch(function(err) {
        log.warn({stack: err.stack || null, error: err.message || err, status: err.status}, "Error occurred");
        res.status(err.status).send(err.message || err);
        next();
      });
  }
};

module.exports = app => {
  app.use('/api/identify', identify);
};
