var inherits = require('util').inherits,
  log        = require('../helpers/logger');

var ClientError = function (message, status, level) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || "ClientError occurred";
  this.title = "ClientError occurred";
  this.level = level || 'warn';
  this.status = status || 400;
};

inherits(ClientError, Error);

ClientError.prototype.log = log.protoLogger;

module.exports = ClientError;
