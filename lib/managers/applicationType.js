/* Manager
 --- applicationTypeSchema ---

 


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  _         = require('underscore'),
  Promise   = require('bluebird');


module.exports = function(applicationTypeSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  applicationTypeSchema.statics.createDoc = function(data) {
    var self = this;

    var dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise(function(resolve, reject) {
      self.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  applicationTypeSchema.statics.updateDoc = function(id, data) {
    var me = this;
    return new Promise(function(resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      me.findById({_id: id})
        .exec()
        .then(function(doc) {
          doc = _.extend(doc, data);


          return new Promise(function(resolve, reject){
            doc.save().then(reject, resolve);
          });
        })
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  applicationTypeSchema.statics.fetch = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      self.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  applicationTypeSchema.statics.list = function(options) {
    var self = this;

    return new Promise(function(resolve, reject) {
      //query object
      var q = {};

      //date range filter
      if(options.from) {
        q.update_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-update_at';

      //Pagenation
      var size = options.size || 50;
      var page = options.page ? options.page * size : 0;

      //query model
      self.find(q)
        .skip(page)
        .limit(size)
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  applicationTypeSchema.statics.delete = function(id) {
    var self = this;

    return new Promise(function(resolve, reject){
      if(typeof id === "string") id = ObjectId(id);

      self.findOneAndRemove({id: id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  applicationTypeSchema.methods.getCreateDate = function() {
    return new Date(this._id.getTimestamp());
  };



};