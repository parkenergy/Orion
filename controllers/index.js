var DataHelper = require('./helpers/dataHelper.js');

var Controller = function (collection) {
  if (typeof collection !== "string") {
    throw new Error("collection parameter must be specified");
  }
  this.collection = collection;
  this.dataHelper = new DataHelper(collection);
  console.log(this.dataHelper);
};


Controller.prototype.handler = function (fn, req, res, next) {
  fn(req, function (err, data) {
    if (err) { return next(err); }
    return res.send(data);
  });
};

Controller.prototype.list = function (req, res, next) {
  var self = this;
  return self.handler(self.dataHelper.list, req, res, next);
};

Controller.prototype.create = function (req, res, next) {
  var self = this;
  return self.handler(self.dataHelper.create, req, res, next);
};

Controller.prototype.read = function (req, res, next) {
  var self = this;
  return self.handler(self.dataHelper.read, req, res, next);
};

Controller.prototype.update = function (req, res, next) {
  var self = this;
  return self.handler(self.dataHelper.update, req, res, next);
};

Controller.prototype.destroy = function (req, res, next) {
  var self = this;
  return self.handler(self.dataHelper.destoy, req, res, next);
};

module.exports = Controller;
