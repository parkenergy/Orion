/* Includes
----------------------------------------------------------------------------- */
var DataHelper = require('./dataHelper.js');

/* Declaration
----------------------------------------------------------------------------- */
var Controller = function (collection) {
  if (typeof collection !== "string") {
    throw new Error("collection parameter must be specified");
  }
  var dataHelper = new DataHelper(collection);

  return {
    _collection: collection,
    _dataHelper: dataHelper,

    list: function (req, res, next) {
      return handler(dataHelper.list, req, res, next);
    },
    create: function (req, res, next) {
      return handler(dataHelper.create, req, res, next);
    },
    read: function (req, res, next) {
      return handler(dataHelper.read, req, res, next);
    },
    update: function (req, res, next) {
      return handler(dataHelper.update, req, res, next);
    },
    destroy: function (req, res, next) {
      return handler(dataHelper.destroy, req, res, next);
    }
  };
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
  return handler(self.dataHelper.destroy, req, res, next);
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
