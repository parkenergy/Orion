var inherits = require('util').inherits;

var ClientError = function (message, status) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.status = status || 400;
};

module.exports = ClientError;
