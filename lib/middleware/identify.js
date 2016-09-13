var User = require('../models/user');
var log = require('../helpers/logger');
var AuthError = require('../errors/auth');


function identify(req, res) {
  var token = req.get('Authorization');
  if(!token) {
    req.identity = null;
    next();
  }
  else {
    User.identify(token)
      .then(function (user) {
        if(! user) {
          var err = new AuthError("Failed to identify!");
          log.warn({stack: err.stack || null, error: err.message || err, status: err.status}, "AuthError occurred");
          return res.status(err.status).send(err.message || err);
        }
        req.identity = user;
        res.json(user);
      })
      .catch(function(err) {
        log.warn({stack: err.stack || null, error: err.message || err, status: err.status}, "Error occurred");
        res.status(err.status).send(err.message || err);
      });
  }
}

module.exports = function (app) {
  app.use('/api/identify', identify);
};
