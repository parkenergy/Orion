var inherits = require('util').inherits;

var AuthError = function (message, status) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.status = status || 500;
};

module.exports = AuthError;
