var User = require('../models/user');
var log = require('../helpers/logger');


function identify(req, res, next) {
  var token = req.get('Authorization');
  if(!token) {
    req.identity = null;
    next();
  }
  else {
    User.identity(token)
      .then(function (user) {
        req.identity = user;
        next();
      })
      .catch(function(err) {
        log.error({error: err.message || err, error: err.stack}, "Failed to identify by token");
        req.identity = null;
        next();
      });
  }
}

module.exports = function (app) {
  app.use(identify);
};
