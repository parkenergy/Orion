/* Manager
 --- editHistorySchema ---

 Edit history for workOrders


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
// 'use strict';

const ObjectId  = require('mongoose').Types.ObjectId;
  // Promise       = require('bluebird');


module.exports = function(editHistorySchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  editHistorySchema.statics.createDoc = function(data) {

    return new Promise((resolve, reject) => {
      const dataArr = [].concat(data); //Ensure data is an array, cast single object to array

      dataArr.map(doc => {
        if(doc.workOrder && doc.user) {
          if(typeof doc.workOrder === 'string') doc.workOrder = ObjectId(doc.workOrder);
          if(typeof doc.user === 'string') doc.user = ObjectId(doc.user);
        }
      });

      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  editHistorySchema.statics.updateDoc = function(id, data) {

    return new Promise((resolve, reject) => {
      if(!id) reject(new Error("Missing _id"));
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  editHistorySchema.statics.fetch = function(id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  editHistorySchema.statics.list = function(options) {

    return new Promise((resolve, reject) => {
      if(!options.workOrder) return reject("Missing workOrder ID for lookup");
      if(typeof options.workOrder === "string") options.workOrder = ObjectId(options.workOrder);

      //query model
      this.find({workOrder: options.workOrder})
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  editHistorySchema.statics.delete = function(id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
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
