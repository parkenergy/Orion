/* Manager
 --- workOrderSchema ---

 An order of work information


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  _         = require('underscore'),
  Promise   = require('bluebird');


module.exports = function(workOrderSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  workOrderSchema.statics.createDoc = function(data) {
    var self = this;

    var dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise(function(resolve, reject) {
      self.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  workOrderSchema.statics.updateDoc = function(id, data) {
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
  workOrderSchema.statics.fetch = function(id) {
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
  workOrderSchema.statics.list = function(options) {
    var self = this;

    return new Promise(function(resolve, reject) {
      //query object
      var q = {};

      if(options.unit) q.unitNumber = options.unit;

      if(options.tech) q.techId = options.tech;

      if(options.loc) {
        q.header = {
          leaseName: options.loc
        }
      }

      if(options.cust) {
        q.header = {
          customerName: options.cust
        }
      }

      //date range filter
      if(options.from && options.to) {
        q.update_at = {
          $gte: options.from,
          $lt: options.to
        };
      }

      //query model
      self.find(q)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  workOrderSchema.statics.delete = function(id) {
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

  workOrderSchema.methods.getCreateDate = function() {
    return new Date(this._id.getTimestamp());
  };



};
