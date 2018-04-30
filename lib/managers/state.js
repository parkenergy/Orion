/* Manager
 --- stateSchema ---




 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise       = require('bluebird');


module.exports = function (stateSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  stateSchema.statics.createDoc = function (data) {

    const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  stateSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  stateSchema.statics.fetch = function (id) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  stateSchema.statics.sync = function (options) {
    return new Promise((resolve, reject) => {
      const q = {};
      if (options.id) {
        q.id = {
          $in: options.id,
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
  stateSchema.statics.list = function (options) {

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

      const cursor = this.find(q);

      if((options.skip !== null || options.skip !== undefined) &&
        (options.limit !== null || options.limit !== undefined)) {
        cursor
          .skip(options.skip * options.limit)
          .limit(options.limit);
      }

      //query model
      cursor
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  stateSchema.statics.delete = function (id) {


    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  stateSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };



};
