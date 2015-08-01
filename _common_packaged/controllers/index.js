/* Includes
----------------------------------------------------------------------------- */
var DataHelper = require('./dataHelper.js');
var _ = require('underscore');

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
    remove: function (req, res, next) {
      return handler(dataHelper.remove, req, res, next);
    }
  };
};


/* Private Functions
----------------------------------------------------------------------------- */
function handler (fn, req, res, next) {
  fn(req, function (err, data) {
    if (err) { console.error(err); return next(err); }
    else {
      return res.send(data);
      // the toJSON call de-mongoosifies the data in order to expose virtuals.
      // if (!(data instanceof Array)) { return res.send(data); }
      // else {
      //   var arr = [];
      //   data.forEach(function (ele) { arr.push(ele.toJSON()); });
      //   return res.send(arr);
      // }
    }
  });
}

/* Exports
----------------------------------------------------------------------------- */
module.exports = Controller;
