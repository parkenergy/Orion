/* Manager
 --- partOrderSchema ---

 Order for parts


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  _             = require('lodash'),
  ClientError   = require('../errors/client'),
  User          = require('../models/user'),
  Part          = require('../models/part'),
  Promise       = require('bluebird');


module.exports = function(partOrderSchema) {

  /*** MODEL METHODS ***/

  //Create Document
  partOrderSchema.statics.createDoc = function(data) {
    return new Promise((resolve, reject) => {
      let dataArr = [].concat(data);
      if(!data) return reject(new ClientError("Missing document"));
      let newArr;

      this.find({
        orderId: {
          $in: dataArr.reduce((acc, o) => {
            if (o.hasOwnProperty('orderId')) {
              return acc.concat(o.orderId);
            } else {
              return acc;
            }
          }, [])
        }
      })
      .then((foundDocs) => {
        newArr = dataArr.map((doc) => {
          let foundDup = {found: false};
          foundDocs.forEach((fDoc) => {
            if (fDoc.orderId === doc.orderId) {
              foundDup = {obj: fDoc, found: true};
            }
          });
          if (foundDup.found) {
            return foundDup;
          } else {
            return {obj: doc, found: false};
          }
        });
        return newArr;
      })
      .then((objects) => {
        const insertObjects = objects.reduce((acc, cur) => {
          if (cur.found === false) {
            return acc.concat(cur.obj);
          } else {
            return acc;
          }
        }, []);
        return this.insertMany(insertObjects);
      })
      .then((docs) => {
        const promises = [];
        docs.forEach((doc) => {
          promises.push(new Promise((res) => res(doc)));
        });
        newArr.forEach((na) => {
          if (na.found) {
            promises.push(new Promise((res) => res(na.obj)));
          }
        });
        return Promise.all(promises);
      })
      .then(resolve)
      .catch(reject);
    });
  };

  //update single document
  partOrderSchema.statics.updateDoc = function(id, data) {
    return new Promise((resolve, reject) => {
      if(!id) reject(new Error("Missing orderId"));

      this.findOneAndUpdate({orderId: id}, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  partOrderSchema.statics.fetchForm = function(id, poFormID) {
    return new Promise((resolve, reject) => {
      this.find({orderId: id})
        .exec()
        .then((doc) => {
          // if the doc is null
          if(!doc) return {orderId: id, exists: false, poFormID};
          // if the doc is an empty array = [];
          if(doc.length === 0) return {orderId: id, exists: false, poFormID};
          return populateTechByTechId(doc);
        })
        .then(resolve)
        .catch(reject);

    });
  };

  //fetch by _id
  partOrderSchema.statics.fetch = function(id) {
    return new Promise((resolve, reject) => {
      //if(typeof id === "string") id = ObjectId(id);

      this.find({orderId: id})
        .exec()
        .then((doc) => {
          // if the doc is null
          if(!doc) return {orderId: id, exists: false};
          // if the doc is an empty array = [];
          if(doc.length === 0) return {orderId: id, exists: false};
          return populateTechByTechId(doc);
        })
        .then(resolve)
        .catch(reject);

    });
  };

  //list documents
  partOrderSchema.statics.list = function(options) {

    return new Promise((resolve, reject) => {
      //query object
      const q = {};

      //if manager get user techs and self
      if(options.supervised.length > 0){
        q.techId = { $in: options.supervised };
      }

      //date range filter
      if(options.from) {
        q.timeSubmitted = {
          $gte: options.from,
          $lte: options.to || new Date()
        };
      }
      if (options.techId) {
        q.techId = options.techId;
      }
      if (options.destinationID) {
        q.destinationNSID = Number(options.destinationID);
      }
      q.status = {
        $in: _.chain(options.status)
              .pickBy(v => v)
              .keys()
              .value()
      };

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-timeSubmitted';

      //query model
      if(options.report){
        this.partsReport(q)
          .then(resolve)
          .catch(reject);
      } else {
        this.find(q)
          .skip(options.page)
          .limit(options.size)
          .sort(sort)
          .exec()
          .map(populateTechByTechId)
          .then(resolve)
          .catch(reject);
      }
    });
  };

  // Generate a part order report with parts information
  partOrderSchema.statics.partsReport = function (query){
    return new Promise((resolve, reject) => {
      this.aggregate()
        .match(query)
        .exec()
        // reduce the result to CSV format
        .reduce((csv, report) => {
          report.part.description = report.part.description.split(',').join('|');
          if(report.part.isManual){
            return csv + [report.techId, report.orderId, report.partNSID, report.part.number, report.part.vendor, report.part.description].join(',') + '\n';
          } else {
            return csv + [report.techId, report.orderId, report.partNSID, report.part.componentName, report.part.MPN, report.part.description].join(',') + '\n';
          }
        }, 'Tech ID, Order ID, Part NSID, Part #, MPN/Vendor, Part Description\n')
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  partOrderSchema.statics.delete = function(id) {
    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /*** DOCUMENT METHODS ***/

  partOrderSchema.methods.getCreateDate = function() {
    return new Date(this._id.getTimestamp());
  };
};


/*** PRIVATE METHODS ***/

//Populate tech by techId
const populateTechByTechId = order => {
  return new Promise((resolve, reject) => {

    if(order[0]){
      // needed for fetch not to be an array
      order = order[0];
    } else {
      // needed for listing
      order = order.toObject();
    }

    User.findOne({username: order.techId})
      .lean()
      .exec()
      .then((tech) => {
        order.technician = tech;
        return order;
      })
      .then(resolve)
      .catch(reject)
  });
};

const populaterPerPO = (po) => {
  return new Promise((resolve, reject) => {
    if(! +po.partNSID || +po.partNSID === 0) return resolve(po);

    Part.findOne({netsuiteId: po.partNSID})
    .lean()
    .exec()
    .then((part) => {
      po.part = part;

      return po;
    })
    .then(resolve)
    .catch(reject);
  });
};

//Populate part by partNSID
const populatePartByNSID = (pos) =>  {
  return new Promise((resolve, reject) => {
    Promise.all(pos.map((po) => populaterPerPO(po)))
      .then(resolve)
      .catch(reject);
  });
};
