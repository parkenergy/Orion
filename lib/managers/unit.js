/* Manager
 --- unitSchema ---

 Compressor Unit


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  User          = require('../models/user'),
  PmReport      = require('../models/pmReport'),
  Promise       = require('bluebird'),
  log           = require('../helpers/logger');


module.exports = function (unitSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  unitSchema.statics.createDoc = function (data) {

    const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  unitSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  unitSchema.statics.fetch = function (unitNumber) {

    return new Promise( (resolve, reject) => {

      this.findOne({number: unitNumber})
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  unitSchema.statics.list = function (options) {

    return new Promise( (resolve, reject) => {

      //if(options.page > 0) return resolve([]);

      //query object
      const q = {};

      //Search by Unit Number
      if(options.number) {
        q.number = options.number;
      }

      //Search by Customer Name
      if(options.customer) {
        q.customerName = options.customer;
      }

      //Search by Tech username
      if(options.tech) {
        q.assignedTo = options.tech;
      }

      //Geo Radius Search
      if(options.lng && options.lat) {
        q.geo = {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [options.lng, options.lat]
            },
            $maxDistance: (options.radius || 50) / 0.00062137
          }
        }
      }

      //Geo Within Search
      //TODO


      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

      //Pagination
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;

      if (options.supervisor) {
        User.getTechsForSupervisor(options.supervisor)
          .then(techs => {
            q.assignedTo = {$in: techs};

            log.debug({q}, "Unit Query(w/ supervisor)");

            return this.find(q)
              .skip(page)
              .limit(size)
              .sort(sort)
              .exec();
          })
          .then(resolve)
          .catch(reject);
      } else {
        log.debug({q, size, page, sort}, "Unit Query");

        //query model
        this.find(q)
          .skip(page)
          .limit(size)
          .sort(sort)
          .exec()
          .then(resolve)
          .catch(reject);
      }
    });
  };

  //Delete document
  unitSchema.statics.delete = function (id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  unitSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };



};
