/**
 *            callReport
 *
 * Created by marcusjwhelan on 1/6/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
    log           = require('../helpers/logger'),
    ClientError   = require('../errors/client'),
    Promise       = require('bluebird');

module.exports = function (callReportSchema) {

  /*** MODEL METHODS ***/

  // Create Document
  callReportSchema.statics.createDoc = function (data) {
    return new Promise((resolve, reject) => {
      if(!data) return reject(new ClientError('Missing Call Report Document'));

      this.create(data)
        .then(resolve)
        .catch(reject)
    });
  };

  // update single doc
  callReportSchema.statics.updateDoc = function (id, data) {
    return new Promise((resolve, reject) => {
      if(!id) reject(new Error("Missing orderId"));
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    })
  };

  // Fetch by _id
  callReportSchema.statics.fetch = function (id) {

    return new Promise((resolve, reject) => {
      if(typeof id === 'string') id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject)
    })
  };

  // List all
  callReportSchema.statics.list = function (options) {
    return new Promise((resolve, reject) => {
      const q = {};

      // date range filter
      if(options.from) {
        q.callTime = {
          $gte: options.from,
          $lte: options.to || new Date()
        };
      }

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-callTime';

      this.find(q)
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

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
      .exec()
      .then(resolve)
      .catch(reject);
    });
  };

};










