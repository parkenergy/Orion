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
        .lean()
        .exec()
        .then(this.populatePM)
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
      if(options.pos) {
        q.geo = {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: parseCoords(options.pos)
            },
            $maxDistance: (options.radius || 50) / 0.00062137
          }
        }
      }

      //Geo Within Search
      if(options.ne && options.sw) {
        let ne = parseCoords(options.ne);
        let sw = parseCoords(options.sw);

        q.geo = {
          $geoWithin: {
            $box: [ne, sw]
          }
        }
      }


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
              .lean()
              .exec();
          })
          .then(this.populatePM)
          .then(resolve)
          .catch(reject);
      } else {
        log.debug({q, size, page, sort}, "Unit Query");

        //query model
        this.find(q)
          .skip(page)
          .limit(size)
          .sort(sort)
          .lean()
          .exec()
          .then(this.populatePM)
          .then(resolve)
          .catch(reject);
      }
    });
  };

  //Populate PMReport for unit/s
  unitSchema.statics.populatePM = function (_units) {
    return new Promise((resolve, reject) => {
      //Ensure units is an array, this allows this method to support single units as well
      const units = [].concat(_units);

      PmReport.find({unitNumber: {$in: units.map(unit => unit.number)} })
        .exec()
        .then(reports => {

          //hashmap of reports by unit number
          const reportsMap = {};

          //populate hashmap
          reports.forEach(report => reportsMap[report.unitNumber] = report);

          //merge units with pmReports(or null if they don't have one)
          return units.map(unit => {
            unit.pmReport = reportsMap[unit.number] || null;

            return unit;
          });
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

//parse coordinates formatted like `lng:lat`
function parseCoords(pos) {
  let coords = pos.split(':');
  return [Number(coords[0]), Number(coords[1])];
}
