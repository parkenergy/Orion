'use strict';

const ObjectId = require('mongoose').Types.ObjectId,
    request = require('request-promise'),
    log = require('../helpers/logger'),
    Promise = require('bluebird');

module.exports = function (syncDataSchema) {

  syncDataSchema.statics.createDoc = function (data) {
    const dataArr = [].concat(data);
    return new Promise( (resolve, reject) => {
      log.info({data: data}, 'data')
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  syncDataSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {

      this.findOneAndUpdate({username: id}, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  syncDataSchema.statics.fetch = function (id) {
    return new Promise((resolve, reject) => {
      if (typeof id === "string") id = ObjectId(id);
      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  syncDataSchema.statics.list = function (options) {
    return new Promise( (resolve, reject) => {
      //query object
      const q = {};

      //date range filter
      if(options.from) {
        q.date = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }
      if (options.username) {
        q.username = options.username;
      }
      //sort string eg 'field' or '-field'
      const sort = options.sort || '-date';

      // Pagenation
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;
      //query model
      this.find(q)
        .skip(page)
        .limit(size)
        .sort(sort)
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };


  syncDataSchema.statics.delete = function (id) {
    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);
      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  syncDataSchema.statics.lastForTech = function(obj) {
    return new Promise((resolve, reject) => {
      this.find(obj)
        .limit(1)
        .sort({$natural: -1})
        .exec()
        .then((res) => {
          if (res.length === 0) {
            resolve(null);
          } else {
            resolve(res[0]);
          }
        })
        .catch(reject);
    });
  };
};
