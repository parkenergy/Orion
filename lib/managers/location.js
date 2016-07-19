/* Manager
 --- locationSchema ---

 Job site location


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  _         = require('lodash'),
  Promise   = require('bluebird');


module.exports = function (locationSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  locationSchema.statics.createDoc = function (data) {
    var self = this;

    var dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise(function (resolve, reject) {
      self.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  locationSchema.statics.updateDoc = function (id, data) {
    var me = this;
    return new Promise(function (resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      me.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  locationSchema.statics.fetch = function (id) {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      self.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  locationSchema.statics.list = function (options) {
    var self = this;

    return new Promise(function (resolve, reject) {
      //query object
      var q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-updated_at';

      //Pagenation
      var size = options.size || 50;
      var page = options.page ? options.page * size : 0;

      //query model
      self.find(q)
        .skip()
        .limit()
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  locationSchema.statics.delete = function (id) {
    var self = this;

    return new Promise(function (resolve, reject){
      if(typeof id === "string") id = ObjectId(id);

      self.findOneAndRemove({id: id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  locationSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };



};
