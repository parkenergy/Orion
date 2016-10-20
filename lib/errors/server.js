var inherits = require('util').inherits,
  log        = require('../helpers/logger');

var ServerError = function (message, status, level) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || "ServerError occurred";
  this.title = "ServerError occurred";
  this.level = level || 'error';
  this.status = status || 500;
};

inherits(ServerError, Error);

ServerError.prototype.log = log.protoLogger;

module.exports = ServerError;
