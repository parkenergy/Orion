/* Manager
 --- partSchema ---

 A compressor parts


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
// 'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  ClientError   = require('../errors/client');


module.exports = function (partSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  partSchema.statics.createDoc = function (data) {
    return new Promise((resolve, reject) => {
      if(!data) return reject(new ClientError('Missing part Document'));

      this.create(data)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  partSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  partSchema.statics.fetch = function (id) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  partSchema.statics.sync = function (options) {
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
  partSchema.statics.list = function (options) {

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

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

      //Pagenation
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;

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
  partSchema.statics.delete = function (id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  partSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };

};
