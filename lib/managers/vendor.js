'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise       = require('bluebird');


module.exports = function (vendorSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  vendorSchema.statics.createDoc = function (data) {
    const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  vendorSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  vendorSchema.statics.fetch = function (id) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  vendorSchema.statics.list = function (options) {

    return new Promise( (resolve, reject) => {
      //query object
      const q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lte: options.to || new Date()
        };
      }
      // Pagination
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

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
  vendorSchema.statics.delete = function (id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  vendorSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };



};
