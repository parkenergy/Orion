/* Manager
 --- editHistorySchema ---

 Edit history for workOrders


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  _         = require('underscore'),
  Promise   = require('bluebird');


module.exports = function(editHistorySchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  editHistorySchema.statics.createDoc = function(data) {
    var self = this;

    return new Promise(function(resolve, reject) {
      var dataArr = [].concat(data); //Ensure data is an array, cast single object to array

      dataArr.map(function(doc) {
        if(doc.workOrder && doc.user) {
          if(typeof doc.workOrder === 'string') doc.workOrder = ObjectId(doc.workOrder);
          if(typeof doc.user === 'string') doc.user = ObjectId(doc.user);
        }
      });

      self.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  editHistorySchema.statics.updateDoc = function(id, data) {
    var me = this;
    return new Promise(function(resolve, reject) {
      if(!id) reject(new Error("Missing _id"));
      if(typeof id === "string") id = ObjectId(id);

      me.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  editHistorySchema.statics.fetch = function(id) {
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
  editHistorySchema.statics.list = function(options) {
    var self = this;

    return new Promise(function(resolve, reject) {
      if(!options.workOrder) return reject("Missing workOrder ID for lookup");
      if(typeof options.workOrder === "string") options.workOrder = ObjectId(options.workOrder);

      //query model
      self.find({workOrder: options.workOrder})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  editHistorySchema.statics.delete = function(id) {
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

  editHistorySchema.methods.getCreateDate = function() {
    return new Date(this._id.getTimestamp());
  };



};
