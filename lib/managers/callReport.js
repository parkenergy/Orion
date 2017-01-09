/**
 *            callReport
 *
 * Created by marcusjwhelan on 1/6/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var ObjectId    = require('mongoose').Types.ObjectId,
    _           = require('lodash'),
    log         = require('../helpers/logger'),
    ClientError = require('../errors/client'),
    User        = require('../models/user'),
    Promise     = require('bluebird');

module.exports = function (callReportSchema) {

  /*** MODEL METHODS ***/

  // Create Document
  callReportSchema.statics.createDoc = function (data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if(!data) return reject(new ClientError('Missing Call Report Document'));

      self.create(data)
        .then(resolve)
        .catch(reject)
    });
  };

  // update single doc
  callReportSchema.statics.updateDoc = function (id, data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if(!id) reject(new Error("Missing orderId"));
      if(typeof id === "string") id = ObjectId(id);

      self.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    })
  };

  // Fetch by _id
  callReportSchema.statics.fetch = function (id) {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(typeof id === 'string') id = ObjectId(id);

      self.findById(id)
        .exec()
        .then(resolve)
        .catch(reject)
    })
  };

  // List all
  callReportSchema.statics.list = function (options) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var q = {};

      // date range filter
      if(options.from) {
        q.timeCreated = {
          $gte: options.from,
          $lte: option.to || new Date()
        };
      }

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-timeCreated';

      self.find(q)
        .skip(options.skip)
        .limit(options.limit)
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    })
  };

  // Delete
  callReportSchema.statics.delete = function(id) {
    var self = this;

    return new Promise(function(resolve, reject){
      if(typeof id === "string") id = ObjectId(id);

      self.findOneAndRemove({id: id})
      .exec()
      .then(resolve)
      .catch(reject);
    });
  };

};










