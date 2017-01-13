/* Manager
 --- vendorSchema ---

 Parts Vendor


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise   = require('bluebird');


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
          $lt: options.to || new Date()
        };
      }

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

      //query model
      this.find(q)
        .skip()
        .limit()
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

      this.findOneAndRemove({id: id})
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
