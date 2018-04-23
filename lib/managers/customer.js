'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise       = require('bluebird'),
  log           = require('../helpers/logger');


module.exports = function (customerSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  customerSchema.statics.createDoc = function (data) {

    const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  customerSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  customerSchema.statics.fetch = function (id) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  customerSchema.statics.sync = function (options) {
    return new Promise((resolve, reject) => {
      const q = {};
      if (options.netsuiteId) {
        q.netsuiteId = {
          $in: options.netsuiteId,
        }
      }
      this.find(q)
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //list documents
  customerSchema.statics.list = function (options) {

    return new Promise( (resolve, reject) => {
      //query object
      const q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }

      // Regex for querying Customer name
      if(options.regex) {
        if(options.regex.name) {
          q.name = {
            $regex: `.*${options.regex.name}.*`,
            $options: 'i'
          }
        }
      }

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

      // Pagination
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;

      //log.debug({q, size, page, sort}, 'Customer Query');

      //query model
      const cursor = this.find(q);

      if(options.page) {
        cursor
          .skip(page)
          .limit(size);
      }

      cursor
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  customerSchema.statics.delete = function (id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  customerSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };

};
