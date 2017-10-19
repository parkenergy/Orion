/* Manager
 --- workOrderSchema ---

 An order of work information


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId = require('mongoose').Types.ObjectId,
  request = require('request-promise'),
  Unit = require('../models/unit'),
  User = require('../models/user'),
  Customer = require('../models/customer'),
  EditHistory = require('../models/editHistory'),
  _ = require('lodash'),
  diff = require('deep-diff').diff,
  log = require('../helpers/logger'),
  Promise = require('bluebird'),
  ClientError = require('../errors/client'),
  AuthError = require('../errors/auth'),
  nodemailer = require('nodemailer'),
  GmailMailer = require('../helpers/email_helper'),
  ServerError = require('../errors/server');

module.exports = function (workOrderSchema) {
  
  /*** MODEL METHODS ***/
  
  //Create Document/s
  workOrderSchema.statics.createDoc = function (data) {
    return new Promise((resolve, reject) => {
      
      let dataArr = [].concat(data); //Ensure data is an array, cast single object to array
      
      //clean data
      dataArr.forEach((doc) => {
        delete doc._id;
        delete doc.__v;
      });
      
      // Consider the input an array of incoming work orders
      // Promise chain
      Promise.join(
        //Populate user/tech
        User.find({
          username: {
            // get every User with that techId
            $in: _.map(dataArr, 'techId')
          }
        }),
        //Populate unit
        Unit.find({
          netsuiteId: {
            // get every Unit with that Id - should be 1
            $in: dataArr.map((obj) => {
              log.info({issueObj: obj}, "object in question");
              if (obj.hasOwnProperty("unit") && obj !== null && obj !== undefined) {
                if (typeof obj.unit === 'object' && obj.unit !== null && obj.unit !== undefined) {
                  if (obj.unit.hasOwnProperty("netsuiteId")) {
                    return `${obj.unit.netsuiteId}`;
                  } else {
                    return '';
                  }
                } else {
                  return '';
                }
              } else {
                return '';
              }
            }),
          }
        })
      )
      //Insert docs
      .then((docs) => {
        const techDocs = docs[0];
        const unitDocs = docs[1];
        const promises = [];
        dataArr.forEach((doc) => {
          // Pull the technician out of the array of found users with matching username
          const tech = _.find(techDocs, (o) => {
            return doc.techId === o.username;
          });
          log.info({units: unitDocs}, "units found");
          // Pull the unit from the array of found Units with that netsuite ID
          const unit = _.find(unitDocs, (o) => {
            log.info({hmmmm: typeof o._id}, "type of object.unit._id")
            if (doc.hasOwnProperty('unit')) {
              console.log(1)
              return `${o.netsuiteId}` === `${doc.unit.netsuiteId}`;
            }
          });
          log.info({unitFound: unit}, "Actual unit found");
  
          if (tech) doc.technician = tech._id;
          else doc.technician = null;
  
          // if there is a unit populate the found unit with the full sate
          // and the full county just in case.
          if (unit) {
            // only once both state and county are found will it try and
            // do the sync procedures
            // set the doc.unit to the unit id
            doc.unit = unit._id;
            let billable = false;
            // if doc is billable do not sync to netsuite
            if (doc.billingInfo.billableToCustomer) {
              billable = true;
            }
            if (doc.parts.length > 0) {
              for (const part of doc.parts) {
                if (part.isBillable) {
                  billable = true;
                }
              }
            }
    
            // Check if all special fields of a Unit match all the
            // corresponding fields on the work order
            if (doc.type !== "Indirect" && !billable) {
              if (compareWorkorderUnitToUnit(getWorkOrderUnitInfo(doc), unit)) {
                // the doc matches 100% with the current unit state
                const now = new Date();
                doc.updated_at = now;
                doc.timeSynced = now;
                doc.timeApproved = now;
                doc.managerApproved = true;
                doc.approvedBy = doc.techId;
                doc.syncedBy = doc.techId;
                console.log('auto Sync');
                promises.push(this.AutoSyncToNetsuite(doc));
              } else {
                promises.push(new Promise((res) => res(doc)));
              }
            } else {
              promises.push(new Promise((res) => res(doc)));
            }
          } else {
            promises.push(new Promise((res) => res(doc)));
          }
        });
        return Promise.all(promises);
      })
      .then((docs) => this.insertMany(docs))
      .then((docs) => emailWO(docs))
      .then(resolve)
      .catch(reject)
    });
  };
  
  //update single document
  workOrderSchema.statics.updateDoc = function (id, data, identity) {
    
    log.info({id}, "Update Doc");
    return new Promise((resolve, reject) => {
      if (!identity) return reject(new AuthError("Not authenticated"));
      if (identity.role !== 'admin') return reject(new AuthError("You do not have privileges to do that"));
      if (typeof id === "string") id = ObjectId(id);
      
      if (data.netsuiteSyned && !data.timeSynced && !data.syncedBy) {
        log.trace({netsuiteSync: data.netsuiteSyned, id}, "Is Submitting to netsuite?");
        
        this.findById(id)
        .exec()
        .then((doc) => {
          if (doc.netsuiteSync) throw new ClientError("Workorder Already Synced");
          if (doc.type === "Indirect") throw new ClientError("Indirects Cannot Be Synced");
          log.trace("Found document to sync");
          return syncToNetsuite(doc);
        })
        .then((doc) => {
          log.trace("Update doc");
          doc.updated_at = new Date();
          doc.timeSynced = new Date();
          doc.syncedBy = identity.username;
          
          return this.findByIdAndUpdate(doc._id, doc, {safe: false, new: true})
          .lean()
          .exec()
        })
        .then(resolve)
        .catch(reject);
      }
      else {
        this.diff(id, data, identity)
        .then((data) => {
          return this.findByIdAndUpdate(id, data, {safe: false, new: true})
          .lean()
          .exec();
        })
        .then(resolve)
        .catch(reject);
      }
    });
  };
  
  workOrderSchema.statics.diff = function (id, newData, identity) {
    
    return new Promise((resolve, reject) => {
      if (!identity) return reject(new AuthError("Not Authenticated"));
      if (typeof id === "string") id = ObjectId(id);
      this.findById(id)
      .exec()
      .then((oldData) => {
        if (oldData) {
          oldData = JSON.parse(JSON.stringify(oldData));
          if (typeof newData.technician === 'object') newData.technician = oldData.technician;
        }
        
        return diff(oldData, newData) || [];
      })
      .map((change) => {
        const type =
          change.kind === 'E' ? 'Edit' :
            change.kind === 'A' ? 'Array' :
              change.kind === 'N' ? 'Add' :
                change.kind === 'D' ? 'Delete' : null;
        if (type === null) throw(new ServerError("Missing change type"));
        
        return {
          editType: type,
          user: identity.username,
          workOrder: id,
          path: change.path,
          before: change.lhs || null,
          after: change.rhs || null
        };
      })
      .filter((edit) => {
        return !((edit.path.length === 0) ||
          (edit.path[0] === 'timePosted') ||
          (edit.path[0] === "comments") ||
          (edit.path[0] === "unit") ||
          (edit.path[0] === "_id") ||
          (edit.editType === "Add") ||
          (edit.path[3] === "highlight") ||
          (edit.path[0] === "managerApproved") ||
          (edit.path[0] === "unitNumber"));
      })
      .then((docs) => {
        log.trace(docs);
        if (docs.length > 0) {
          return EditHistory.insertMany(docs);
        }
        return docs;
      })
      .then(() => {
        resolve(newData);
      })
      .catch(reject);
    });
  };
  
  //Manager approval method
  workOrderSchema.statics.managerApprove = function (id, identity) {
    
    return new Promise((resolve, reject) => {
      if (!identity) return reject(new AuthError("Not authenticated"));
      if (identity.role !== 'admin' && identity.role !== 'manager') return reject(new AuthError("You do not have privileges to do that"));
      if (typeof id === "string") id = ObjectId(id);
      
      this.findByIdAndUpdate(id, {
        $set: {
          approvedBy: identity.username,
          timeApproved: new Date(),
          managerApproved: true
        }
      })
      .then(resolve)
      .catch(reject);
    });
  };
  
  //fetch by _id
  workOrderSchema.statics.fetch = function (id) {
    
    return new Promise((resolve, reject) => {
      if (typeof id === "string") id = ObjectId(id);
      
      this.findById(id)
      .exec()
      .then(populateTechByTechId)
      .then(resolve)
      .catch(reject);
    });
  };
  
  //count documents
  workOrderSchema.statics._count = function (options) {
    return new Promise((resolve, reject) => {
      let query = {};
      let userQuery = null;
      
      const Q = queryConstructor(options, userQuery, query);
      query = Q.query;
      userQuery = Q.userQuery;
      
      if (userQuery) {
        User.find(userQuery, {username: 1})
        .exec()
        .then(users => {
          let ids = _.map(users, 'username');
          
          if (options.supervised.length > 0) {
            ids = _.intersection(ids, options.supervised);
          }
          
          query.techId = {$in: ids};
          
          return this.find(query)
          .count()
        })
        .then(resolve)
        .catch(reject);
        
      } else {
        this.find(query)
        .count()
        .then(resolve)
        .catch(reject)
      }
    });
  };
  
  //list documents
  workOrderSchema.statics.list = function (options) {
    
    return new Promise((resolve, reject) => {
      //query object
      let query = {};
      let userQuery = null;
      
      const Q = queryConstructor(options, userQuery, query);
      
      query = Q.query;
      userQuery = Q.userQuery;
      
      //query models
      if (options.report) {
        this.timeReport(query)
        .then(resolve)
        .catch(reject);
      }
      else if (userQuery) {
        User.find(userQuery, {username: 1})
        .exec()
        .then((users) => {
          log.trace({users: users}, "Query technicians by name");
          // ids actually are the users usernames!!!
          let ids = _.map(users, 'username');
          
          if (options.supervised.length > 0) {
            ids = _.intersection(ids, options.supervised);
          }
          
          log.trace({ids: ids}, "IDs of users");
          
          query.techId = {$in: ids};
          
          log.trace({query: query}, "Query workorders");
          if (options.report) {
            return this.timeReport(query);
          }
          else {
            return this.find(query)
            .skip(options.skip)
            .limit(options.limit)
            .sort(options.sort)
            .exec()
          }
        })
        .map(populateTechByTechId)
        .then(resolve)
        .catch(reject);
      }
      else {
        this.find(query)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort)
        .exec()
        .map(populateTechByTechId)
        .then(resolve)
        .catch(reject);
      }
    });
  };
  
  workOrderSchema.statics.approveAndUpdate = function (id, doc, identity) {
    
    return new Promise((resolve, reject) => {
      if (!identity) return reject(new AuthError("Not authenticated"));
      if (typeof id === 'string') id = ObjectId(id);
      
      this.diff(id, doc, identity)
      .then((data) => {
        data.timeApproved = new Date();
        data.managerApproved = true;
        data.approvedBy = identity.username;
        return this.findByIdAndUpdate(id, data, {save: false, new: true})
        .lean()
        .exec();
      })
      .then(resolve)
      .catch(reject);
    })
  };
  
  // get the unapproved workorders
  workOrderSchema.statics.unapprovedByArea = function (users) {
    return new Promise((resolve, reject) => {
      function area () {
        return {area: "", count: 0};
      }
      
      const allPromises = [];
      const TheseUsers = JSON.parse(users);
      const all = [];
      TheseUsers.forEach((tech) => {
        const thisArea = area();
        thisArea.area = tech.area;
        allPromises.push(this.privateAggregateArea(tech, thisArea, all));
      });
      Promise.all(allPromises)
      .then(() => {
        resolve(all);
      })
      .catch(reject);
    });
  };
  
  workOrderSchema.statics.privateAggregateArea = function (tech, thisArea, all) {
    return new Promise((resolve, reject) => {
      this.aggregate()
      .match({
        techId: tech.username,
        managerApproved: false
      })
      .group({
        _id: {
          class: "$class"
        },
        count: {$sum: 1}
      })
      .match({
        count: {$gte: 1}
      })
      .project({
        count: 1
      })
      .exec()
      .then((res) => {
        if (res.length > 0) {
          thisArea.count = res[0].count;
        } else {
          thisArea.count = 0;
        }
        all.push(thisArea);
        resolve();
      })
      .catch(reject);
    });
  };
  
  //Generate a time report for technicians
  workOrderSchema.statics.timeReport = function (query) {
    return new Promise((resolve, reject) => {
      // Aggregate for tech
      this.aggregate()
      // Query working set
      .match(query)
      // Only keep fields we need, calculate timeStarted/Submitted difference in minutes
      .project({
        techId: 1,
        times: {
          timeStarted: '$timeStarted',
          timeSubmitted: '$timeSubmitted'
        },
        laborCodes: 1
      })
      // Group by TechId
      .group({
        _id: "$techId",
        times: {$push: '$times'},
        laborCodes: {$push: '$laborCodes'}
      })
      .exec()
      // Convert times to proper time strings(excel time format)
      .map((report) => {
        const lcMinutes = report.laborCodes.map(laborCodesToMinutes)
        .reduce((a, b) => { return a + b }, 0);
        
        const minLogged = report.times
        .map((timeObj) => {
          if (!timeObj.timeStarted && !timeObj.timeSubmitted) return 0;
          
          // Ensure they are date objects
          const timeStarted = timeObj.timeStarted;
          const timeSubmitted = timeObj.timeSubmitted;
          
          // Get difference in minutes
          return (timeSubmitted.getTime() - timeStarted.getTime()) / 1000 / 60;
        })
        .reduce((a, b) => { return a + b }, 0);
        
        return {
          tech: report._id,
          lcTime: minToTimeStr(lcMinutes),
          timeLogged: minToTimeStr(minLogged)
        }
      })
      // Reduce results to CSV format
      .reduce((csv, report) => {
        return csv + [report.tech, report.timeLogged, report.lcTime].join(',') + '\n';
      }, 'TECH,TIME LOGGED,LC TIME\n')
      .then(resolve)
      .catch(reject);
    });
  };
  
  //Delete document
  workOrderSchema.statics.delete = function (id) {
    return new Promise((resolve, reject) => {
      if (typeof id === "string") id = ObjectId(id);
      
      this.findOneAndRemove({id})
      .exec()
      .then(resolve)
      .catch(reject);
    });
  };
  
  //Get WorkOrders for Unit
  workOrderSchema.statics.getUnitWorkOrders = function (options) {
    return new Promise((resolve, reject) => {
      if (!options.unit) return reject(new ClientError("Missing  Unit Number"));
      
      this.list(options)
      .then(resolve)
      .catch(reject);
    });
  };
  
  workOrderSchema.statics.AutoSyncToNetsuite = function(doc) {
    return new Promise((resolve, reject) => {
      this.findOne({timeSubmitted: doc.timeSubmitted}).exec()
        .then((document) => {
          if (document === null) {
            return syncToNetsuite(doc);
          } else {
            return new Promise((res) => res(null));
          }
        })
        .then(resolve)
        .catch((err) => {
          log.info({error: err}, "Sync Error");
          doc.netsuiteSyned = false;
          doc.timeSynced = null;
          doc.syncedBy = '';
          resolve(doc);
        });
    });
  };
  
  /*** DOCUMENT METHODS ***/
  
  workOrderSchema.methods.getCreateDate = function () {
    return new Date(this._id.getTimestamp());
  };
};


/*** PRIVATE METHODS ***/

/**
 * From an incoming Work order return unit info of work order as
 * one object.
 * (wo) => obj
 */
const getWorkOrderUnitInfo = (wo) => ({
  engineSerial: wo.unitReadings.engineSerial,
  compressorSerial: wo.unitReadings.compressorSerial,
  number: wo.unitNumber,
  state: wo.header.state,
  county: wo.header.county,
  geo: wo.geo,
  customerName: wo.header.customerName,
  locationName: wo.header.leaseName
});

/**
 * Compare the incoming work order unit information to an actual
 * unit.
 * (wo, unit) => boolean
 */
const compareWorkorderUnitToUnit = (wo, unit) => {
  return (wo.number === unit.number &&
    wo.geo.coordinates[0] === unit.geo.coordinates[0] &&
    wo.geo.coordinates[1] === unit.geo.coordinates[1] &&
    wo.state === unit.state.name &&
    wo.county === unit.county.name &&
    wo.locationName === unit.locationName &&
    wo.customerName === unit.customerName &&
    wo.engineSerial === unit.engineSerial &&
    wo.compressorSerial === unit.compressorSerial);
};

const emailWO = (wos) => {
  let mailer = new GmailMailer();
  if (Object.prototype.toString.call(wos) === '[object Array]') {
    wos.forEach((wo) => {
      if (wo.type === "New Set" || wo.type === "Release") {
        mailer.transport.verify(function (error, success) {
          if (error) {
            log.trace({error: error}, "Issue with verify");
          } else {
            log.trace({success: success}, "Server is ready to take our messages");
          }
        });
        let mailOptions = {
          from: '"Orion Alerts" <orionalerts@parkenergyservices.com>',
          to: 'orionalerts@parkenergyservices.com',
          subject: `${wo.type} | ${wo.header.unitNumber} | ${wo.header.customerName} | ${wo.header.leaseName}`,
          // text: ,
          html: `
      <body>
          <a href="http://orion.parkenergyservices.com/#/workorder/review/${wo._id}">Link to Work Order</a>
          <br>
      </body>
      `,
        };
        mailer.transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            return log.trace({errorSend: error}, "error sending message");
          }
          log.trace({message: info.messageId}, "Message sent");
          log.trace({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
        });
      }
    });
  } else {
    if (wos.type === "New Set" || wos.type === "Release") {
      mailer.transport.verify(function (error, success) {
        if (error) {
          log.trace({error: error}, "Issue with verify");
        } else {
          log.trace({success: success}, "Server is ready to take our messages");
        }
      });
      let mailOptions = {
        from: '"Orion Alerts" <orionalerts@parkenergyservices.com>',
        to: 'orionalerts@parkenergyservices.com',
        subject: `${wos.type} | ${wos.header.unitNumber} | ${wos.header.customerName} | ${wos.header.leaseName}`,
        // text: ,
        html: `
      <body>
          <a href="http://orion.parkenergyservices.com/#/workorder/review/${wos._id}">Link to Work Order</a>
          <br>
      </body>
      `,
      };
      mailer.transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return log.trace({errorSend: error}, "error sending message");
        }
        log.trace({message: info.messageId}, "Message sent");
        log.trace({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
      });
    }
  }
  
  return wos;
};

const populateTechByTechId = wo => {
  return new Promise((resolve, reject) => {
    wo = wo.toObject();
    User.findOne({username: wo.techId})
    .lean()
    .exec()
    .then(tech => {
      wo.technician = tech ? tech : null;
      return wo;
    })
    .then(resolve)
    .catch(reject)
  });
};

const populateCustomerByName = wo => {
  
  log.trace("populate customer by name");
  
  return new Promise((resolve, reject) => {
    /*if(!wo.header.customerName) return reject(new ClientError("Missing customerName on Workorder to populate"));*/
    
    Customer.findOne({name: wo.header.customerName})
    .lean()
    .exec()
    .then((cust) => {
      log.trace({customer: cust}, "Customer Found");
      wo.customer = cust || null;
      if (wo.customer === null) {
        wo.customer = {netsuiteId: ''};
      }
      
      return wo;
    })
    .then(resolve)
    .catch(reject);
  });
};

const syncToNetsuite = doc => {
  
  log.trace("Sync to netsuite1");
  return new Promise((resolve, reject) => {
    if (!doc.header.unitNumberNSID) {
      doc.header.unitNumberNSID = doc.unit.netsuiteId;
    }
    
    if (!doc.header.unitNumberNSID) {
      log.debug({doc: doc}, "Indirect or missing unit NSID");
      return reject(new ClientError("Indirect WorkOrders will not be synced"));
    }
    
    
    populateCustomerByName(doc)
    .then((wo) => {
      const nswo = netSuiteFormat(wo);
      log.trace({nswo: nswo}, "Send Netsuite POST Request");
      return request.post({
        url: 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1',
        headers: {
          'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2017~',
          'User-Agent': 'SuiteScript-Call'
        },
        json: nswo
      });
    })
    .then((resp) => {
      log.trace({response: resp}, "Netsuite Response");
      if (!resp.nswoid) throw(new ClientError("POSTing Workorder to Netsuite failed!"));
      
      doc.netsuiteId = resp.nswoid;
      doc.netsuiteSyned = true;
      
      resolve(doc);
    })
    .catch(reject);
  });
};

// Convert a Labor Code object into hours and minutes
const laborCodesToMinutes = lc => {
  let totalMin = 0;
  
  //iterate laborcode categories
  _.forIn(lc, (v) => {
    //if(!lc.hasOwnProperty(v)) return;
    //iterate laborcodes inside category
    _.forIn(v, (v, k) => {
      //subtract negative time adjustment out of totalMin
      if ((k !== 'negativeAdj') && (k !== 'positiveAdj')) {
        totalMin += v.hours * 60;
        totalMin += v.minutes;
      }
    });
  });
  return totalMin;
};

//Convert minutes to a time string like "hh:mm"
const minToTimeStr = min => {
  let h = Math.floor(min / 60);
  let m = Math.round(min % 60);
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return h + ':' + m;
};

const netSuiteFormat = wo => {
  log.trace("Formate Workorder for netsuite");
  try {
    return {
      
      //FA : "",
      //WOR_ORDR : "" ,
      
      //main
      dummy: 'dummy',
      isPM: wo.pm ? 'T' : 'F',
      techId: wo.techId,
      truckId: wo.truckId,
      truckNSID: wo.truckNSID,
      troubleCall: wo.type === "Trouble Call" ? 'T' : 'F',
      newSet: wo.type === "New Set" ? 'T' : 'F',
      release: wo.type === "Release" ? 'T' : 'F',
      correctiveMaintenance: wo.type === "Corrective" ? 'T' : 'F',
      timeSubmitted: typeof wo.timeSubmitted === 'object' ? wo.timeSubmitted.toISOString() : wo.timeSubmitted,
      
      woStarted: typeof wo.timeStarted === 'object' ? wo.timeStarted.toISOString() : wo.timeStarted,
      woEnded: typeof  wo.timeSubmitted === 'object' ? wo.timeSubmitted.toISOString() : wo.timeSubmitted,
      
      //header
      unitNumber: wo.header.unitNumberNSID,
      customerName: wo.customer.netsuiteId,
      contactName: "",
      county: wo.header.county,
      state: wo.header.state,
      leaseName: wo.header.leaseName,
      rideAlong: wo.header.rideAlong,
      startMileage: wo.header.startMileage,
      endMileage: wo.header.endMileage,
      applicationType: wo.header.applicationtype,
      
      assetType: wo.assetType,
      
      isUnitRunningOnDeparture: wo.misc.isUnitRunningOnDeparture ? 'T' : 'F',
      
      //unit ownership
      isCustomerUnit: wo.unitOwnership.isCustomerUnit ? 'T' : 'F',
      isRental: wo.unitOwnership.isRental ? 'T' : 'F',
      
      //billing info
      billableToCustomer: wo.billingInfo.billableToCustomer ? 'T' : 'F',
      warrantyWork: wo.billingInfo.warrantyWork ? 'T' : 'F',
      AFE: wo.billingInfo.AFE ? 'T' : 'F',
      
      //pm check list
      lowDischargeKill: wo.pmChecklist.killSettings.lowDischargeKill,
      highSuctionKill: wo.pmChecklist.killSettings.highSuctionKill,
      highDischargeKill: wo.pmChecklist.killSettings.highDischargeKill,
      lowSuctionKill: wo.pmChecklist.killSettings.lowSuctionKill,
      highDischargeTempKill: wo.pmChecklist.killSettings.highDischargeTempKill,
      
      //engine checks
      battery: wo.pmChecklist.engineChecks.battery ? 'T' : 'F',
      capAndRotor: wo.pmChecklist.engineChecks.capAndRotor ? 'T' : 'F',
      airFilter: wo.pmChecklist.engineChecks.airFilter ? 'T' : 'F',
      oilAndFilters: wo.pmChecklist.engineChecks.oilAndFilters ? 'T' : 'F',
      magPickup: wo.pmChecklist.engineChecks.magPickup ? 'T' : 'F',
      belts: wo.pmChecklist.engineChecks.belts ? 'T' : 'F',
      guardsAndBrackets: wo.pmChecklist.engineChecks.guardsAndBrackets ? 'T' : 'F',
      sparkPlugs: wo.pmChecklist.engineChecks.sparkPlugs ? 'T' : 'F',
      plugWires: wo.pmChecklist.engineChecks.plugWires ? 'T' : 'F',
      driveLine: wo.pmChecklist.engineChecks.driveLine ? 'T' : 'F',
      
      //general checks
      kills: wo.pmChecklist.generalChecks.kills ? 'T' : 'F',
      airHoses: wo.pmChecklist.generalChecks.airHoses ? 'T' : 'F',
      coolerForCracks: wo.pmChecklist.generalChecks.coolerForCracks ? 'T' : 'F',
      coolerLouverMovement: wo.pmChecklist.generalChecks.coolerLouverMovement ? 'T' : 'F',
      coolerLouverCleaned: wo.pmChecklist.generalChecks.coolerLouverCleaned ? 'T' : 'F',
      pressureReliefValve: wo.pmChecklist.generalChecks.pressureReliefValve ? 'T' : 'F',
      scrubberDump: wo.pmChecklist.generalChecks.scrubberDump ? 'T' : 'F',
      plugInSkid: wo.pmChecklist.generalChecks.plugInSkid ? 'T' : 'F',
      filledDayTank: wo.pmChecklist.generalChecks.filledDayTank ? 'T' : 'F',
      fanForCracking: wo.pmChecklist.generalChecks.fanForCracking ? 'T' : 'F',
      panelWires: wo.pmChecklist.generalChecks.panelWires ? 'T' : 'F',
      oilPumpBelt: wo.pmChecklist.generalChecks.oilPumpBelt ? 'T' : 'F',
      
      fuelPressureFirstCut: wo.pmChecklist.fuelPressureFirstCut,
      fuelPressureSecondCut: wo.pmChecklist.fuelPressureSecondCut,
      visibleLeaksNotes: wo.pmChecklist.visibleLeaksNotes,
      
      //engine compression
      cylinder1: wo.pmChecklist.engineCompression.cylinder1,
      cylinder2: wo.pmChecklist.engineCompression.cylinder2,
      cylinder3: wo.pmChecklist.engineCompression.cylinder3,
      cylinder4: wo.pmChecklist.engineCompression.cylinder4,
      cylinder5: wo.pmChecklist.engineCompression.cylinder5,
      cylinder6: wo.pmChecklist.engineCompression.cylinder6,
      cylinder7: wo.pmChecklist.engineCompression.cylinder7,
      cylinder8: wo.pmChecklist.engineCompression.cylinder8,
      
      //unit readings
      suctionPressure: wo.unitReadings.suctionPressure,
      dischargePressure: wo.unitReadings.dischargePressure,
      flowMCF: wo.unitReadings.flowMCF,
      rpm: wo.unitReadings.rpm,
      dischargeTemp1: wo.unitReadings.dischargeTemp1,
      dischargeTemp2: wo.unitReadings.dischargeTemp2,
      hourReading: wo.unitReadings.hourReading,
      compressorSerial: wo.unitReadings.compressorSerial,
      engineSerial: wo.unitReadings.engineSerial,
      engineOilPressure: wo.unitReadings.engineOilPressure,
      alternatorOutput: wo.unitReadings.alternatorOutput,
      compressorOilPressure: wo.unitReadings.compressorOilPressure,
      engineJWTemp: wo.unitReadings.engineJWTemp,
      engineManifoldVac: wo.unitReadings.engineManifoldVac,
      
      //emission readings
      afrmvTarget: wo.emissionsReadings.afrmvTarget !== null ? wo.emissionsReadings.afrmvTarget : '0',
      catalystTempPre: wo.emissionsReadings.catalystTempPre !== null ? wo.emissionsReadings.catalystTempPre : '0',
      catalystTempPost: wo.emissionsReadings.catalystTempPost !== null ? wo.emissionsReadings.catalystTempPost : '0',
      permitNumber: wo.emissionsReadings.permitNumber !== null ? wo.emissionsReadings.permitNumber : '0',
      
      //comments
      repairsDescription: wo.comments.repairsDescription,
      repairsReason: wo.comments.repairsReason,
      calloutReason: wo.comments.calloutReason,
      newsetNotes: wo.comments.newsetNotes,
      releaseNotes: wo.comments.releaseNotes,
      indirectNotes: wo.comments.indirectNotes,
      timeAdjustmentNotes: wo.comments.timeAdjustmentNotes,
      
      //misc
      leaseNotes: wo.misc.leaseNotes,
      unitNotes: wo.misc.unitNotes,
      latitude: wo.geo.coordinates[1],
      longitude: wo.geo.coordinates[0],
      
      //labor codes
      //basic
      safety: formatLaborCodeTime(wo.laborCodes.basic.safety),
      positiveAdj: formatLaborCodeTime(wo.laborCodes.basic.positiveAdj),
      negativeAdj: formatLaborCodeTime(wo.laborCodes.basic.negativeAdj),
      lunch: formatLaborCodeTime(wo.laborCodes.basic.lunch),
      custRelations: formatLaborCodeTime(wo.laborCodes.basic.custRelations),
      telemetry: formatLaborCodeTime(wo.laborCodes.basic.telemetry),
      environmental: formatLaborCodeTime(wo.laborCodes.basic.environmental),
      diagnostic: formatLaborCodeTime(wo.laborCodes.basic.diagnostic),
      serviceTravel: formatLaborCodeTime(wo.laborCodes.basic.serviceTravel),
      optimizeUnit: formatLaborCodeTime(wo.laborCodes.basic.optimizeUnit),
      pm: formatLaborCodeTime(wo.laborCodes.basic.pm),
      washUnit: formatLaborCodeTime(wo.laborCodes.basic.washUnit),
      training: formatLaborCodeTime(wo.laborCodes.basic.training),
      
      //engine labor codes
      oilAndFilter: formatLaborCodeTime(wo.laborCodes.engine.oilAndFilter),
      addOil: formatLaborCodeTime(wo.laborCodes.engine.addOil),
      compression: formatLaborCodeTime(wo.laborCodes.engine.compression),
      replaceEngine: formatLaborCodeTime(wo.laborCodes.engine.replaceEngine),
      replaceCylHead: formatLaborCodeTime(wo.laborCodes.engine.replaceCylHead),
      replaceRadiator: formatLaborCodeTime(wo.laborCodes.engine.replaceRadiator),
      fuelSystem: formatLaborCodeTime(wo.laborCodes.engine.fuelSystem),
      ignition: formatLaborCodeTime(wo.laborCodes.engine.ignition),
      starter: formatLaborCodeTime(wo.laborCodes.engine.starter),
      lubrication: formatLaborCodeTime(wo.laborCodes.engine.lubrication),
      exhaust: formatLaborCodeTime(wo.laborCodes.engine.exhaust),
      alternator: formatLaborCodeTime(wo.laborCodes.engine.alternator),
      driveOrCoupling: formatLaborCodeTime(wo.laborCodes.engine.driveOrCoupling),
      sealsAndGaskets: formatLaborCodeTime(wo.laborCodes.engine.sealsAndGaskets),
      
      //emissions labor codes
      install: formatLaborCodeTime(wo.laborCodes.emissions.install),
      test: formatLaborCodeTime(wo.laborCodes.emissions.test),
      repair: formatLaborCodeTime(wo.laborCodes.emissions.repair),
      
      //panel labor codes
      panel: formatLaborCodeTime(wo.laborCodes.panel.panel),
      electrical: formatLaborCodeTime(wo.laborCodes.panel.electrical),
      
      //compressor labor codes
      inspect: formatLaborCodeTime(wo.laborCodes.compressor.inspect),
      replace: formatLaborCodeTime(wo.laborCodes.compressor.replace),
      
      //cooler labor codes
      cooling: formatLaborCodeTime(wo.laborCodes.cooler.cooling),
      
      //vessel labor codes
      dumpControl: formatLaborCodeTime(wo.laborCodes.vessel.dumpControl),
      reliefValve: formatLaborCodeTime(wo.laborCodes.vessel.reliefValve),
      suctionValve: formatLaborCodeTime(wo.laborCodes.vessel.suctionValve),
      
      //parts
      parts: wo.parts
    };
  }
  catch (e) {
    log.debug({error: e.message, stack: e.stack}, "Error occured while formating workorder for netsuite");
  }
};

const queryConstructor = (options, userQuery, query) => {
  if (options.unit) query.unitNumber = options.unit;
  
  if (options.tech) {
    userQuery = {$text: {$search: options.tech}};
  }
  
  if (options.loc) {
    query['header.leaseName'] = {
      $regex: options.loc,
      $options: 'i'
    }
  }
  
  if (options.cust) {
    query['header.customerName'] = {
      $regex: options.cust,
      $options: 'i'
    }
  }
  
  /*
  * Select options for checkboxes search
  *
  * billed to customer:       BC        unapproved: U
  * billed to customerParts:  BCP       approved:   A
  * billed:                   B         synced:     S
  *
  * need to construct an and/or mapping
  * */
  
  // if something on both sides were selected
  if ((options.billable || options.billParts || options.billed) && (options.approved || options.unapproved || options.synced)) {
    console.log("always this");
    query.$and = [];
    
    // billed was selected but synced was not
    // possible: (B || BCP || BC) && (A || U) && S
    if (!options.synced && options.billed) {
      // (B
      query.$and.push({$or: [{"billingInfo.billed": true}]});
      // || BCP
      if (options.billParts) {
        query.$and[0].$or.push({
          parts: {
            $elemMatch: {
              isBillable: true
            }
          }
        });
      }
      // || BC)
      if (options.billable) {
        query.$and[0].$or.push({"billingInfo.billableToCustomer": true});
      }
      // && (A
      if (options.approved) {
        query.$and.push({$or: [{managerApproved: true}]});
      }
      // || U)
      if (options.unapproved) {
        if (query.$and[1]) {
          query.$and[1].$or.push({managerApproved: false});
          query.$and[1].$or.push({managerApproved: {$exists: false}});
        } else {
          query.$and.push({$or: [{managerApproved: false}]});
          query.$and[1].$or.push({managerApproved: {$exists: false}});
        }
      }
      // && S
      query.$and.push({netsuiteSyned: false});
      
      // synced selected but not billed
      // possible:  (S || A || U) && (BCP || BC) && B
    } else if (options.synced && !options.billed) {
      console.log("this happens");
      // (S
      query.$and.push({$or: [{netsuiteSyned: true}]});
      // || A
      if (options.approved) {
        query.$and[0].$or.push({managerApproved: true});
      }
      // || U)
      if (options.unapproved) {
        query.$and[0].$or.push({managerApproved: false});
        query.$and[0].$or.push({managerApproved: {$exists: false}});
      }
      // && (BCP
      if (options.billParts) {
        query.$and.push({
          $or: [{
            parts: {
              $elemMatch: {
                isBillable: true
              }
            }
          }]
        });
      }
      // || BC)
      if (options.billable) {
        if (query.$and[1]) {
          query.$and[1].$or.push({"billingInfo.billableToCustomer": true});
        } else {
          query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
        }
      }
      // && B   .. billed is newer, must check if exists Nov2016
      query.$and.push({$or: [{"billingInfo.billed": false}]});
      query.$and[2].$or.push({"billingInfo.billed": {$exists: false}});
      
      // billed and synced selected nothing else
      // possible: (A || U) && (BCP || BC) && (B) && S
    } else if (!options.synced && !options.billed) {
      // (A
      if (options.approved) {
        query.$and.push({$or: [{managerApproved: true}]});
      }
      // || U)
      if (options.unapproved) {
        if (query.$and[0]) {
          query.$and[0].$or.push({managerApproved: false});
          query.$and[0].$or.push({managerApproved: {$exists: false}});
        } else {
          query.$and.push({$or: [{managerApproved: false}]});
          query.$and[0].$or.push({managerApproved: {$exists: false}});
        }
      }
      // && (BCP
      if (options.billParts) {
        query.$and.push({
          $or: [{
            parts: {
              $elemMatch: {
                isBillable: true
              }
            }
          }]
        });
      }
      // || BC)
      if (options.billable) {
        if (query.$and[1]) {
          query.$and[1].$or.push({"billingInfo.billableToCustomer": true});
        } else {
          query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
        }
      }
      // && (B)
      query.$and.push({$or: [{"billingInfo.billed": false}]});
      query.$and[2].$or.push({"billingInfo.billed": {$exists: false}});
      // && S
      query.$and.push({netsuiteSyned: false});
    }
    // All right side possible checked also works the same if none selected
    // possible (A || U || S)
  } else if ((options.approved || options.unapproved || options.synced) && (!options.billed && !options.billable && !options.billParts)) {
    query.$and = [];
    // (A
    if (options.approved) {
      query.$and.push({$or: [{managerApproved: true}]});
    }
    // || U
    if (options.unapproved) {
      if (query.$and[0]) {
        query.$and[0].$or.push({managerApproved: false});
        query.$and[0].$or.push({managerApproved: {$exists: false}});
      } else {
        query.$and.push({$or: [{managerApproved: false}]});
        query.$and[0].$or.push({managerApproved: {$exists: false}});
      }
    }
    // || S)
    if (options.synced) {
      if (query.$and[0]) {
        query.$and[0].$or.push({netsuiteSyned: true});
      } else {
        query.$and.push({$or: [{netsuiteSyned: true}]});
      }
    } else {
      query.$and.push({netsuiteSyned: false});
    }
    // All left possible checked works the same if none selected
    // synced is auto set to false so included
    // possible (BC || BCP || B) && S
  } else if ((options.billParts || options.billable || options.billed && (!options.approved && !options.unapproved && !options.synced))) {
    query.$and = [];
    // (BC
    if (options.billable) {
      query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
    }
    // || BCP
    if (options.billParts) {
      if (query.$and[0]) {
        query.$and[0].$or.push({
          parts: {
            $elemMatch: {
              isBillable: true
            }
          }
        });
      } else {
        query.$and.push({
          $or: [{
            parts: {
              $elemMatch: {
                isBillable: true
              }
            }
          }]
        });
      }
    }
    // || B)
    if (!options.billed) {
      query.$and.push({$or: [{"billingInfo.billed": false}]});
      query.$and[1].$or.push({"billingInfo.billed": {$exists: false}});
    } else {
      query.$and.push({"billingInfo.billed": options.billed});
    }
    // && S
    query.$and.push({netsuiteSyned: false});
  }
  
  
  //date range filter
  if (options.from && options.to) {
    query.timeSubmitted = {
      $gte: options.from,
      $lte: options.to || new Date()
    };
  }
  
  if (options.supervised && options.role === 'manager') {
    query.techId = {$in: options.supervised};
  }
  
  return {options, userQuery, query}
};

const formatLaborCodeTime = lc => {
  const min = (lc.hours * 60) + lc.minutes;
  return min.toString();
};
