/* Manager
 --- reviewNoteSchema ---

 Notes for workorder review&#x2F;edit


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  _         = require('underscore'),
  Promise   = require('bluebird');


module.exports = function(reviewNoteSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  reviewNoteSchema.statics.createDoc = function(data) {
    var self = this;

    return new Promise(function(resolve, reject) {
      if(!data.workOrder) return reject(new Error("Missing workOrder ID on Note"));
      if(!data.user) return reject(new Error("Missing User on Note"));
      if(typeof data.workOrder === 'string') data.workOrder = ObjectId(data.workOrder);

      self.create(data)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  reviewNoteSchema.statics.updateDoc = function(id, data) {
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
  reviewNoteSchema.statics.fetch = function(id) {
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
  reviewNoteSchema.statics.list = function(options) {
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
  reviewNoteSchema.statics.delete = function(id) {
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

  reviewNoteSchema.methods.getCreateDate = function() {
    return new Date(this._id.getTimestamp());
  };



};
