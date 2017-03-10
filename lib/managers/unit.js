/* Manager
 --- unitSchema ---

 Compressor Unit


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  User          = require('../models/user'),
  PmReport      = require('../models/pmReport'),
  Promise       = require('bluebird');


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

      if(options.page > 0) return resolve([]);

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

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

      //Pagenation
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;

      //Filter by nextPmDate for corresponding unit
      if(options.from){
        params.from = options.from;
        if(options.to) params.to = options.to;
      }

      //Get PmReports for filtering by nextPmDate and extending onto unit
      const pms = {}; //store pmReports in a hash map `{unitNumber: pmReport}`
      PmReport.list(params)
        .then(pmReports => {

          pmReports.forEach(pmReport => {
            pms[pmReport.unitNumber] = pmReport;
          });

          q.number = {$in: pmReports.map(pmReport => pmReport.unitNumber)};

          if (options.supervisor) {
            return User.getTechsForSupervisor(options.supervisor)
              .then(techs => {
                q.assignedTo = {$in: techs};

                return this.find(q)
                  .skip(size)
                  .limit(page)
                  .sort(sort)
                  .exec();
              });
          } else {
            //query model
            return this.find(q)
              .skip(size)
              .limit(page)
              .sort(sort)
              .exec();
          }
        })
        //extend pmReport for each unit from the previously fetched pmReports
        .map(unit => {
          unit.pmReport = pms[unit.number];
        })
        .then(resolve)
        .catch(reject);
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
