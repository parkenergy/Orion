/* Manager
 --- areaSchema ---




 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  _         = require('lodash'),
  Promise   = require('bluebird');


module.exports = function (areaSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  areaSchema.statics.createDoc = function (data) {


    var dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  areaSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  areaSchema.statics.fetch = function (id) {


    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  areaSchema.statics.list = function (options) {


    return new Promise( (resolve, reject) => {
      //query object
      var q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-updated_at';

      //Pagenation
      var size = options.size || 50;
      var page = options.page ? options.page * size : 0;

      //query model
      this.find(q)
        .skip(page)
        .limit(size)
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  areaSchema.statics.delete = function (id) {


    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id: id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  areaSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };



};
