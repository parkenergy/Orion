
var DateHelper = require('./dateHelper');
var dateHelper = new DateHelper();
var db = require('../../models');


var DataHelper = function (collection) {
  if (!db[collection]) {
    throw new Error('The database has no collection "' + collection + '"');
  }
  this.collection = db[this.collection];
};


DataHelper.prototype.list = function (req, callback) {
  var self = this;

  var query = req.query || {};
  // this bit is needed for scalability (http://stackoverflow.com/a/23640287)
  if (!query.createdOn) {
    query.createdOn = (req.since instanceof Date) ?
                        { $gte: req.since } :
                        { $gte: dateHelper.oneYearAgo() };
  };

  // optimization of find operation
  var select = req.select || null;
  var skip = req.skip || 0;
  var limit = req.limit || 1000;
  var sort = req.sort || '-createdOn';

  self.collection.find(query)
    .select(select)
    .skip(skip)
    .limit(limit)
    .sort( '-createdOn' )
    .exec(callback); // callback takes params (err, data);
};


DataHelper.prototype.create = function (req, callback) {
  var self = this;

  if (!req.query) {
    console.warn("req.query should be defined for create operations.");
  }

  if (!req.obj) {
    var msg = 'req.obj cannot be undefined for create operations.';
    return callback(new Error(msg), null);
  }

  var query = req.query || { id: req.obj._id }; // default to _id field

  // findOrCreate from query parameter (http://stackoverflow.com/a/16362833)
  self.collection.findAndModify({
    query: query,
    update: {
      $setOnInsert: req.obj
    },
    new: true,   // return new doc if one is upserted
    upsert: true // insert the document if it does not exist
  }).exec(callback);
};


DataHelper.prototype.read = function (req, callback) {
  var self = this;

  if (!req.query) {
    var msg = 'req.query cannot be undefined for read operations.';
    return callback(new Error(msg), null);
  }

  var select = req.select || null;
  self.collection.findOne(req.query)
    .select(select)
    .exec(callback);
};

DataHelper.prototype.update = function (req, callback) {
  var self = this;

  if (!req.obj) {
    var msg = 'req.obj cannot be undefined for update operations.';
    return callback(new Error(msg), null);
  }

  if (!req.obj._id) {
    var msg = 'req.obj._id cannot be undefined for update operations.';
    return callback(new Error(msg), null);
  }

  // findOrCreate from query parameter (http://stackoverflow.com/a/16362833)
  self.collection.findAndModify({
    query: { id: req.obj._id },
    update: req.obj,
    new: true,   // return new doc if one is upserted
    upsert: true // insert the document if it does not exist
  }).exec(callback);
};

module.exports = DataHelper;
