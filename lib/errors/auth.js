var inherits = require('util').inherits,
  log        = require('../helpers/logger');

var AuthError = function (message, status, level) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || "AuthError occurred";
  this.title = "AuthError occurred";
  this.level = level || 'warn';
  this.status = status || 403;
};

inherits(AuthError, Error);

AuthError.prototype.log = log.protoLogger;


module.exports = AuthError;
