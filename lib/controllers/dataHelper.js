/* Includes (test)
 ----------------------------------------------------------------------------- */
var DateHelper = require('../helpers/dateHelper');
var dateHelper = new DateHelper();
var db = require('../models');
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('underscore');

/* Declaration
 ----------------------------------------------------------------------------- */
var DataHelper = function (collection) {

  if (!db[collection]) {
    throw new Error('The database has no collection "' + collection + '"');
  }

  collection = db[collection];

  return {

    _collection: collection,

    list: function (req, callback) {
      var params = req.query;
      var query = {};

      console.log('params: ', params);
      //Sorting
      var sortBy = params.sortBy || 'updated_at';
      var sortOrder = params.sortOrder ? toNumber(params.sortOrder) : -1;
      var sortObj = {};
      sortObj[sortBy] = sortOrder;

      //Pagenation
      var size = params.size || 50;
      var page = params.page ? params.page * size : 0;

      console.log('size: ', size);

      //Date Filter
      if(params.from) {
        query.updated_at = {
          $gte: params.from,
          $lt: params.to || new Date()
        };
      }

      collection.find(query)
        .skip(page)
        .limit(size)
        .sort(sortObj)
        .exec(callback); // callback takes params (err, data);
    },
    create: function (req, callback) {

      if (!req.query || _.isEmpty(req.query)) {
        console.warn("req.query should be defined for create operations.");
        req.query = req.body; //default behavior
      }

      if (!req.body) {
        var msg = 'req.body cannot be undefined for create operations.';
        return callback(new Error(msg), null);
      }
      req.body.updated_at = new Date();

      delete req.body._v;
      delete req.body.__v;
      //cast dates

      collection.findOneAndUpdate(
        req.query,
        req.body,
        { upsert: true, new: true } // insert the document if it does not exist
      ).exec(callback);
    },

    read:  function (req, callback) {
      if (_.isEmpty(req.params) || !req.params.id) {
        var msg = 'req.params.id cannot be undefined for read operations.';
        return callback(new Error(msg), null);
      }

      var query = {_id: req.params.id };
      var select = req.select || null;
      collection.findOne(query)
        .select(select)
        .exec(callback);
    },

    update: function (req, callback) {
      var msg = "";
      if (!req.body || _.isEmpty(req.body)) {
        msg = 'req.body cannot be undefined or empty for update operations.';
        return callback(new Error(msg), null);
      }
      if (!req.body._id) {
        msg = 'req.body._id cannot be undefined for update operations.';
        return callback(new Error(msg), null);
      }
      // findOrCreate from query parameter (http://stackoverflow.com/a/16362833)
      req.body.updated_at = new Date();
      collection.findOne({ _id: req.body._id }, function (err, model) {
        if (err) { return callback (err); }
        model.update(req.body, function (err, data) {
          if (err) { return callback(err); }
          return collection.findOne({ _id: req.body._id }).exec(callback);
        });
      });
    },

    remove: function (req, callback) {
      if (_.isEmpty(req.params) || !req.params.id) {
        var msg = 'req.params.id cannot be undefined for read operations.';
        return callback(new Error(msg), null);
      }
      collection.findOneAndRemove({_id: req.params.id}).exec(callback);
    }
  };
};

// http://stackoverflow.com/questions/8749971/can-i-query-mongodb-objectid-by-date
function ObjectIdFromDate(date) {
  // Convert string date to Date object (otherwise assume timestamp is a date)
  if (!(date instanceof Date)) {
    throw new Error("date parameter must be instance of Date object");
  }

  // Convert date object to hex seconds since Unix epoch
  var hexSeconds = Math.floor(date/1000).toString(16);

  // Create an ObjectId with that hex timestamp
  var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");
  return constructedObjectId;
}

//Cast to number, default to -1
function toNumber(num){
  return Number(num) || -1;
}

/* Exports
 ----------------------------------------------------------------------------- */
module.exports = DataHelper;
