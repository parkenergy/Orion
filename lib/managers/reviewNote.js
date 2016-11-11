/* Manager
 --- reviewNoteSchema ---

 Notes for workorder review&#x2F;edit


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId   = require('mongoose').Types.ObjectId,
  _            = require('underscore'),
  Promise      = require('bluebird'),
  ClientError  = require('../errors/client');


module.exports = function(reviewNoteSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  reviewNoteSchema.statics.createDoc = function(data) {


    return new Promise((resolve, reject) => {
      if(!data.workOrder) return reject(new ClientError("Missing workOrder ID on Note"));
      if(!data.user) return reject(new ClientError("Missing User on Note"));
      if(typeof data.workOrder === 'string') data.workOrder = ObjectId(data.workOrder);

      this.create(data)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  reviewNoteSchema.statics.updateDoc = function(id, data) {

    return new Promise((resolve, reject) => {
      if(!id) reject(new ClientError("Missing _id"));
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  reviewNoteSchema.statics.fetch = function(id) {


    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  reviewNoteSchema.statics.list = function(options) {


    return new Promise((resolve, reject) => {
      if(!options.workOrder) return reject(new ClientError("Missing workOrder ID for lookup"));
      if(typeof options.workOrder === "string") options.workOrder = ObjectId(options.workOrder);

      //query model
      this.find({workOrder: options.workOrder})
        .sort({updated_at: -1})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  reviewNoteSchema.statics.delete = function(id) {


    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id: id})
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
