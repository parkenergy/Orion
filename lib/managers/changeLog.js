'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise       = require('bluebird'),
  log           = require('../helpers/logger');

module.exports = function (changeLogSchema) {

  changeLogSchema.createDoc = function (data) {
    const dataArr = [].concat(data);
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.updateDoc = function (id, data) {
    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);
      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.fetch = function (id) {
    return new Promise( (resolve, reject) => {
      this.findOne({_id: id})
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.list = function (options) {
    return new Promise((resolve, reject) => {
      let q = {};
      if (options.from) {
        q.changeMade = {
          $gte: options.from,
          $lte: options.to || new Date(),
        };
      }

      const sort = options.sort || '-changeMade';

      this.find(q)
        .skip(options.skip)
        .limit(options.limit)
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.delete = function(id) {
    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);
      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };
};
