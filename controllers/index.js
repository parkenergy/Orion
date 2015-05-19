/* Includes
----------------------------------------------------------------------------- */
var DataHelper = require('./dataHelper.js');

/* Declaration
----------------------------------------------------------------------------- */
var Controller = function (collection) {
  if (typeof collection !== "string") {
    throw new Error("collection parameter must be specified");
  }
  this.collection = collection;
  this.dataHelper = new DataHelper(collection);
};

/* Functions
----------------------------------------------------------------------------- */
Controller.prototype.list = function (req, res, next) {
  var self = this;
  return handler(self.dataHelper.list, req, res, next);
};

Controller.prototype.create = function (req, res, next) {
  var self = this;
  return handler(self.dataHelper.create, req, res, next);
};

Controller.prototype.read = function (req, res, next) {
  var self = this;
  return handler(self.dataHelper.read, req, res, next);
};

Controller.prototype.update = function (req, res, next) {
  var self = this;
  return handler(self.dataHelper.update, req, res, next);
};

Controller.prototype.destroy = function (req, res, next) {
  var self = this;
  return handler(self.dataHelper.destoy, req, res, next);
};

/* Private Functions
----------------------------------------------------------------------------- */
function handler (fn, req, res, next) {
  fn(req, function (err, data) {
    if (err) { return next(err); }
    return res.send(data);
  });
}

/* Exports
----------------------------------------------------------------------------- */
module.exports = Controller;
