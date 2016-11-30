/* Manager
 --- partOrderSchema ---

 Order for parts


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  _           = require('lodash'),
  log         = require('../helpers/logger'),
  ClientError = require('../errors/client'),
  User        = require('../models/user'),
  Promise     = require('bluebird');


module.exports = function(partOrderSchema) {

  /*** MODEL METHODS ***/

  //Create Document
  partOrderSchema.statics.createDoc = function(data) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if(!data) return reject(new ClientError("Missing document"));
      self.create(data)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  partOrderSchema.statics.updateDoc = function(id, data) {
    var me = this;
    return new Promise(function(resolve, reject) {
      if(!id) reject(new Error("Missing _id"));

      me.findOneAndUpdate({orderId: id}, data, {safe: false, new: true})
        .exec()
        .then(updateTimeStamps)
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  partOrderSchema.statics.fetch = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      self.findById(id)
        .exec()
        .then()
        .then(function (doc) {
          if(!doc) return {orderId: id, exists: false};
          return populateTechByTechId(doc);
        })
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  partOrderSchema.statics.list = function(options) {
    var self = this;

    return new Promise(function(resolve, reject) {
      //query object
      var q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }

      q.status = {
        $in: _.chain(options.status)
              .pickBy(function (v) {
                return v;
              })
              .keys()
      };

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-updated_at';

      //Pagenation
      var size = options.size || 50;
      var page = options.page ? options.page * size : 0;

      //query model
      self.find()
      .exec()
      .then(resolve)
      .catch(reject);
      /*self.find(q)
        .skip(page)
        .limit(size)
        .sort(sort)
        .exec()
        .map(populateTechByTechId)
        .then(resolve)
        .catch(reject);*/
    });
  };

  //Delete document
  partOrderSchema.statics.delete = function(id) {
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

  partOrderSchema.methods.getCreateDate = function() {
    return new Date(this._id.getTimestamp());
  };
};


/*** PRIVATE METHODS ***/

//update timestamps on status change
function updateTimeStamps(order) {
  if(order.status && !order.timeShipped){
    order.timeShipped = ( order.status === 'shipped' ) ? new Date() : null;
  }
  if(order.status && order.timeShipped && !order.timeComplete){
    order.timeComplete = ( order.status === 'completed') ? new Date() : null;
  }

  return order;
}

//Populate tech by techId
function populateTechByTechId(order) {
  return new Promise(function (resolve, reject) {
    order = order.toObject();
    User.findOne({username: order.techId})
      .lean()
      .exec()
      .then(function (tech) {
        order.technician = tech;
        return order;
      })
      .then(resolve)
      .catch(reject)
  });
}
