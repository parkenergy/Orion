/* Manager
 --- inventoryTransferSchema ---

 Inventory transfers between locations


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise       = require('bluebird');


module.exports = function (inventoryTransferSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  inventoryTransferSchema.statics.createDoc = function (data) {


    const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      if(!data) return reject(new ClientError('Missing Inventory Transfer  Document'));

      this.create(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  inventoryTransferSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  inventoryTransferSchema.statics.fetch = function (id) {


    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  inventoryTransferSchema.statics.list = function (options) {


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
  inventoryTransferSchema.statics.delete = function (id) {


    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id: id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  inventoryTransferSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };



};
