/* Includes
----------------------------------------------------------------------------- */
var DateHelper = require('../helpers/dateHelper');
var dateHelper = new DateHelper();
var db = require('../models');
var ObjectId = require('mongoose').Types.ObjectId;

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
      var query = req.query || {};

      // this bit is needed for scalability (http://stackoverflow.com/a/23640287)
      if (!query._id) { // ObjectId has embedded timestamp. Dope right?
        var oneYearAgo = dateHelper.oneYearAgo();
        var objId = ObjectIdFromDate(oneYearAgo);
        query._id = { $gte: objId };
      }

      // optimization of find operation
      var select = req.select || null;
      var skip = req.skip || 0;
      var limit = req.limit || 1000;
      var sort = req.sort || '-createdOn';

      collection.find(query)
        .select(select)
        .skip(skip)
        .limit(limit)
        .sort( '-_id' )
        .exec(callback); // callback takes params (err, data);
    },

    create: function (req, callback) {

      if (!req.query) {
        console.warn("req.query should be defined for create operations.");
      }

      if (!req.obj) {
        var msg = 'req.obj cannot be undefined for create operations.';
        return callback(new Error(msg), null);
      }

      var query = req.query || req.obj; // default to all fields

      // findOrCreate from query parameter (http://stackoverflow.com/a/16362833)
      collection.findOneAndUpdate(
        query,
        req.obj,
        { upsert: true, new: true } // insert the document if it does not exist
      ).exec(callback);
    },

    read:  function (req, callback) {
      if (!req.query) {
        var msg = 'req.query cannot be undefined for read operations.';
        return callback(new Error(msg), null);
      }

      var select = req.select || null;
      collection.findOne(req.query)
        .select(select)
        .exec(callback);
    },

    update: function (req, callback) {
      var msg = "";
      if (!req.obj) {
        msg = 'req.obj cannot be undefined for update operations.';
        return callback(new Error(msg), null);
      }
      if (!req.obj._id) {
        msg = 'req.obj._id cannot be undefined for update operations.';
        return callback(new Error(msg), null);
      }

      // findOrCreate from query parameter (http://stackoverflow.com/a/16362833)
      collection.findOneAndUpdate({
        query: { id: req.obj._id },
        update: req.obj,
        new: true,   // return new doc if one is upserted
        upsert: true // insert the document if it does not exist
      }).exec(callback);
    },

    destroy: function (req, callback) {
      if (!req.obj._id) {
        msg = 'req.obj._id cannot be undefined for destroy operations.';
        return callback(new Error(msg), null);
      }
      // findOrCreate from query parameter (http://stackoverflow.com/a/16362833)
      collection.findOne(req.obj._id)
        .remove(select)
        .exec(callback);
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

/* Exports
----------------------------------------------------------------------------- */
module.exports = DataHelper;
