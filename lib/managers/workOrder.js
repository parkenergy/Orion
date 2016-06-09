/* Manager
 --- workOrderSchema ---

 An order of work information


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var mongoose = require('mongoose'),
  ObjectId   = mongoose.Types.ObjectId,
  Unit       = require('../models/unit'),
  User       = require('../models/user'),
  _          = require('lodash'),
  Promise    = require('bluebird');


module.exports = function (workOrderSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  workOrderSchema.statics.createDoc = function (data) {
    var self = this;

    return new Promise(function (resolve, reject) {

      var dataArr = [].concat(data); //Ensure data is an array, cast single object to array

      //clean data
      dataArr.forEach(function (doc) {
        delete doc._id;
        delete doc.__v;
      });

      //Promise chain
      Promise.join(
        //Populate user/tech
        User.find({
          netsuiteId: {
            $in: _.map(dataArr, _.property('technician.netsuiteId'))
          }
        }).select('_id netsuiteId'),
        //Populate unit
        Unit.find({
          netsuiteId: {
            $in: _.map(dataArr, _.property('unit.netsuiteId'))
          }
        }).select('_id netsuiteId'),
        function (techDocs, unitDocs) {
          dataArr = dataArr.map(function (doc) {
            var tech = _.find(techDocs, function (o) {
              return doc.technician.netsuiteId === o.netsuiteId;
            });

            var unit = _.find(unitDocs, function (o) {
              return doc.unit.netsuiteId === o.netsuiteId;
            });

            if(tech) doc.technician = tech._id;
            else doc.technician = null;

            if(unit) doc.unit = unit._id;
            else doc.unit = null;

            return doc;
          });

          return dataArr;
        }
      )
        //Insert docs
        .then(function (docs) {
          return self.insertMany(docs)
        })
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  workOrderSchema.statics.updateDoc = function (id, data) {
    var me = this;
    return new Promise(function (resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      me.findByIdAndUpdate(id, data, {safe: false, new: true})
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  workOrderSchema.statics.fetch = function (id) {
    var self = this;

    return new Promise(function (resolve, reject) { if (typeof id === "string") id = ObjectId(id);

      self.findById(id)
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  workOrderSchema.statics.list = function (options) {
    var self = this;

    return new Promise(function (resolve, reject) {
      //query object
      var query = {};

      if(options.unit) query.unitNumber = options.unit;

      if(options.tech) query.techId = options.tech;

      if(options.loc) {
        query['header.leaseName'] = {
          $regex: options.loc,
          $options: 'i'
        }
      }

      if(options.cust) {
        query['header.customerName'] = {
          $regex: options.cust,
          $options: 'i'
        }
      }

      //date range filter
      if(options.from && options.to) {
        query.updated_at = {
          $gte: options.from,
          $lt: options.to
        };
      }

      //query model
      self.find(query)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  workOrderSchema.statics.delete = function (id) {
    var self = this;

    return new Promise(function (resolve, reject){
      if(typeof id === "string") id = ObjectId(id);

      self.findOneAndRemove({id: id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  workOrderSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };

};
