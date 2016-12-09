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
  Part        = require('../models/part'),
  Promise     = require('bluebird');


module.exports = function(partOrderSchema) {

  /*** MODEL METHODS ***/

  //Create Document
  partOrderSchema.statics.createDoc = function(data) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if(!data) return reject(new ClientError("Missing document"));

      populatePartByNSID(data)
        .then(function (partOrder) {
          return self.create(partOrder);
        })
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  partOrderSchema.statics.updateDoc = function(id, data) {
    var me = this;
    return new Promise(function(resolve, reject) {
      if(!id) reject(new Error("Missing orderId"));

      me.findOneAndUpdate({orderId: id}, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  partOrderSchema.statics.fetch = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
      //if(typeof id === "string") id = ObjectId(id);

      self.find({orderId: id})
        .exec()
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
        q.timeCreated = {
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
              .value()
      };

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-timeCreated';

      //query model
      self.find(q)
        .skip(options.skip)
        .limit(options.limit)
        .sort(sort)
        .exec()
        .map(populateTechByTechId)
        .then(resolve)
        .catch(reject);
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

//Populate tech by techId
function populateTechByTechId(order) {
  return new Promise(function (resolve, reject) {

    console.log(order);
    if(order[0]){
      // needed for fetch not to be an array
      order = order[0];
    } else {
      // needed for listing
      order = order.toObject();
    }

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

//Populate part by partNSID
function populatePartByNSID(partOrder) {
  return new Promise(function (resolve, reject) {
    if(! +partOrder.partNSID || +partOrder.partNSID === 0) return resolve(partOrder);

    Part.findOne({netsuiteId: partOrder.partNSID})
      .lean()
      .exec()
      .then(function (part) {
        partOrder.part = part;

        return partOrder;
      })
      .then(resolve)
      .catch(reject);
  });
}
