/* Manager
 --- workOrderSchema ---

 An order of work information


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var mongoose  = require('mongoose'),
  request     = require('request-promise'),
  ObjectId    = mongoose.Types.ObjectId,
  Unit        = require('../models/unit'),
  User        = require('../models/user'),
  Customer    = require('../models/customer'),
  EditHistory = require('../models/editHistory'),
  _           = require('lodash'),
  diff        = require('deep-diff').diff,
  log         = require('../helpers/logger'),
  Promise     = require('bluebird'),
  ClientError = require('../errors/client'),
  AuthError   = require('../errors/auth'),
  ServerError = require('../errors/server');


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
  workOrderSchema.statics.updateDoc = function (id, data, identity) {
    var self = this;
    log.info({id: id}, "Update Doc");
    return new Promise(function (resolve, reject) {
      if(!identity) return reject(new AuthError("Not authenticated"));
      if(identity.role !== 'admin') return reject(new AuthError("You do not have privileges to do that"));
      if(typeof id === "string") id = ObjectId(id);



      if(data.netsuiteSyned) {
        log.trace({netsuiteSync: data.netsuiteSyned, id: id}, "Is Submitting to netsuite?");
        self.findById(id)
          .exec()
          .then(function (doc) {
            if(doc.netsuiteSync) throw ClientError("Workorder Already Synced");
            log.trace("Found document to sync");
            return syncToNetsuite(doc);
          })
          .then(function (doc) {
            log.trace("Update doc");
            doc.updated_at = new Date();
            doc.timeSynced = new Date();
            doc.syncedBy = identity.username;

            return self.findByIdAndUpdate(doc._id, doc, {safe: false, new: true})
              .lean()
              .exec()
          })
          .then(resolve)
          .catch(reject);
      }
      else {
        self.diff(id, data, identity)
          .then(function (data) {
            return self.findByIdAndUpdate(id, data, {safe: false, new: true})
              .lean()
              .exec();
          })
          .then(resolve)
          .catch(reject);
      }
    });
  };

  workOrderSchema.statics.diff = function (id, newData, identity) {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(!identity) return reject(new AuthError("Not Authenticated"));
      if(typeof id === "string") id = ObjectId(id);
      self.findById(id)
        .exec()
        .then(function (oldData) {
          if(oldData) {
            oldData = JSON.parse(JSON.stringify(oldData));
            if(typeof newData.technician === 'object') newData.technician = oldData.technician;
          }
          return diff(oldData, newData) || [];
        })
        .map(function (change) {
          var type =
            change.kind === 'E' ? 'Edit':
              change.kind === 'A' ? 'Array' :
                change.kind === 'N' ? 'Add':
                  change.kind === 'D'? 'Delete' : null;
          if(type === null) throw(new ServerError("Missing change type"));

          return  {
            editType: type,
            user: identity.username,
            workOrder: id,
            path: change.path,
            before: change.lhs || null,
            after: change.rhs || null
          };
        })
        .filter(function(edit){
          if((edit.path.length === 0)          ||
          (edit.path[0] === 'timePosted')      ||
          (edit.path[0] === "comments")        ||
          (edit.path[0] === "unit")            ||
          (edit.editType === "Add")            ||
          (edit.path[3] === "highlight")       ||
          (edit.path[0] === "managerApproved") ||
          (edit.path[0] === "unitNumber")){
                return false;}
          else{ return true;}
        })
        .then(function (docs) {
          log.trace(docs);
          if(docs.length > 0){
            return EditHistory.insertMany(docs);
          }
          return docs;
        })
        .then(function () {
          resolve(newData);
        })
        .catch(reject);
    });
  };

  //Manager approval method
  workOrderSchema.statics.managerApprove = function (id, identity) {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(!identity) return reject(new AuthError("Not authenticated"));
      if(identity.role !== 'admin' && identity.role !== 'manager') return reject(new AuthError("You do not have privileges to do that"));
      if(typeof id === "string") id = ObjectId(id);

      self.findByIdAndUpdate(id, {$set: {approvedBy: identity.username, timeApproved: new Date(), managerApproved: true}})
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  workOrderSchema.statics.fetch = function (id) {
    var self = this;

    return new Promise(function (resolve, reject) {
      if (typeof id === "string") id = ObjectId(id);

      self.findById(id)
        .exec()
        .then(populateTechByTechId)
        .then(resolve)
        .catch(reject);
    });
  };

  //list documents
  workOrderSchema.statics.list = function (options) {
    //log.trace({options: options}, "List Workorders");
    var self = this;

    return new Promise(function (resolve, reject) {
      //query object
      var query = {};

      if(options.unit) query.unitNumber = options.unit;

      var userQuery = null;

      if(options.tech) {
        userQuery = {$text: {$search: options.tech}};
        log.trace({query: userQuery}, "User Query");
      }

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

      if(options.billable) {
        query['billingInfo.billableToCustomer'] = true;
      }

      if(options.billParts) {
        query.parts = {
          $elemMatch: {
            isBillable: true
          }
        };
      }

      if(options.synced) {
        query.netsuiteSyned = true;
      } else {
        query.netsuiteSyned = false;
      }

      //Filter by approved and/or unapproved
      var filterApproval = (!options.approved && !options.unapproved);
      if(!filterApproval && options.approved) {
        query.managerApproved = true;
      }
      else if(!filterApproval && options.unapproved) {
        query.$or = [
          {managerApproved: false},
          {managerApproved: {$exists: false}}
        ]
      }

      //date range filter
      if(options.from && options.to) {
        query.updated_at = {
          $gte: options.from,
          $lt: options.to
        };
      }

      if(options.supervised.length > 0) {
        query.techId = {$in: options.supervised};
      }

      //query models
      if(options.report) {
        self.timeReport(query)
          .then(resolve)
          .catch(reject);
      }
      else if(userQuery){
        User.find(userQuery, {username: 1})
          .exec()
          .then(function (users) {
            log.trace({users: users}, "Query technicians by name");
            var ids = _.map(users, 'username');

            if (options.supervised.length > 0) {
              //ids = _.intersectionWith(ids, options.supervised, _.isEqual);
              ids = _.intersection(ids, options.supervised);
          }

            log.trace({ids: ids}, "IDs of users");

            query.techId = {$in: ids};

            log.trace({query: query}, "Query workorders");
            if(options.report) {
              return self.timeReport(query);
            }
            else {
              return self.find(query)
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
        self.find(query)
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

  //Generate a time report for technicians
  workOrderSchema.statics.timeReport = function (query) {
    var self = this;

    return new Promise(function (resolve, reject) {
      // Aggregate for tech
      self.aggregate()
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
        .map(function (report) {
          var lcMinutes = report.laborCodes.map(laborCodesToMinutes)
            .reduce(function (a, b) { return a+b }, 0);

          var minLogged = report.times
            .map(function (timeObj) {
              if(!timeObj.timeStarted && !timeObj.timeSubmitted) return 0;

              // Ensure they are date objects
              var timeStarted = timeObj.timeStarted;
              var timeSubmitted = timeObj.timeSubmitted;

              // Get difference in minutes
              return (timeSubmitted.getTime() - timeStarted.getTime()) / 1000 / 60;
            })
            .reduce(function (a, b) { return a+b }, 0);

          return {
            tech: report._id,
            lcTime: minToTimeStr(lcMinutes),
            timeLogged: minToTimeStr(minLogged)
          }
        })
        // Reduce results to CSV format
        .reduce(function (csv, report) {
          return csv + [report.tech, report.timeLogged, report.lcTime].join(',') + '\n';
        }, 'TECH,TIME LOGGED,LC TIME\n')
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


/*** PRIVATE METHODS ***/

function populateTechByTechId(wo) {
  return new Promise(function (resolve, reject) {
    wo = wo.toObject();
    User.findOne({username: wo.techId})
      .lean()
      .exec()
      .then(function (tech) {
        wo.technician = tech;
        return wo;
      })
      .then(resolve)
      .catch(reject)
  });
}

function populateCustomerByName(wo) {

  log.trace("populate customer by name");

  return new Promise(function (resolve, reject) {
    if(!wo.header.customerName) return reject(new ClientError("Missing customerName on Workorder to populate"));

    Customer.findOne({name: wo.header.customerName}).lean().exec()
      .then(function (cust) {
        log.trace({customer: cust}, "Customer Found");
        wo.customer = cust || null;

        return wo;
      })
      .then(resolve)
      .catch(reject);
  });
}

function syncToNetsuite(doc) {

  log.trace("Sync to netsuite1");
  return new Promise(function (resolve, reject) {
    if(!doc.header.unitNumberNSID) {
      doc.header.unitNumberNSID = doc.unit.netsuiteId;
    }

    if(!doc.header.unitNumberNSID) {
      log.debug({doc: doc}, "Indirect or missing unit NSID");
      return reject(new ClientError("Indirect WorkOrders will not be synced"));
    }

    log.trace("Sync to netsuite2");


    populateCustomerByName(doc)
      .then(function (wo) {
        var nswo = netSuiteFormat(wo);
        log.trace({nswo: nswo}, "Send Netsuite POST Request");
        return request.post({
          url: 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1',
          headers: {
            'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy~2016',
            'User-Agent' : 'SuiteScript-Call'
          },
          json: nswo
        });
      })
      .then(function (resp) {
        log.trace({response: resp}, "Netsuite Response");
        if(!resp.nswoid) throw(new ClientError("POSTing Workorder to Netsuite failed!"));

        doc.netsuiteId = resp.nswoid;
        doc.netsuiteSyned = true;

        resolve(doc);
      })
      .catch(function(err) {
        log.debug({error: err}, "Error occured while syncing workorder to netsuite");
        reject(err);
      });
  });
}

// Convert a Labor Code object into hours and minutes
function laborCodesToMinutes(lc) {
  var totalMin = 0;

  //iterate laborcode categories
  _.forIn(lc, function (v) {
    //if(!lc.hasOwnProperty(v)) return;
    //iterate laborcodes inside category
    _.forIn(v, function (v, k) {
      //subtract negative time adjustment out of totalMin
      if((k !== 'negativeAdj') && (k !== 'positiveAdj')) {
        totalMin += v.hours * 60;
        totalMin += v.minutes;
      }
    });
  });
  return totalMin;
}

//Convert minutes to a time string like "hh:mm"
function minToTimeStr(min) {
  var h = Math.floor(min / 60);
  var m = Math.round(min % 60);
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return h + ':' + m;
}

function netSuiteFormat(wo) {
  log.trace("Formate Workorder for netsuite");
  try {
    return {

      //FA : "",
      //WOR_ORDR : "" ,

      //main
      pm: wo.pm ? 'T' : 'F',
      techId: wo.techId,
      truckId: wo.truckId,
      truckNSID: wo.truckNSID,
      troubleCall: wo.type == "Trouble Call" ? 'T' : 'F',
      correctiveMaintenance: wo.type == "Corrective" ? 'T' : 'F',

      //header
      unitNumber: wo.header.unitNumberNSID,
      customerName: wo.customer.netSuiteId,
      contactName: "",
      county: wo.header.county,
      state: wo.header.state,
      leaseName: wo.header.leaseName,
      rideAlong: wo.header.rideAlong,
      startMileage: wo.header.startMileage,
      endMileage: wo.header.endMileage,

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

      //general checks
      kills: wo.pmChecklist.generalChecks.kills ? 'T' : 'F',
      airHoses: wo.pmChecklist.generalChecks.airHoses ? 'T' : 'F',
      coolerForCracks: wo.pmChecklist.generalChecks.coolerForCracks ? 'T' : 'F',
      coolerLouverMovement: wo.pmChecklist.generalChecks.coolerLouverMovement ? 'T' : 'F',
      coolerLouverCleaned: wo.pmChecklist.generalChecks.coolerLouverCleaned ? 'T' : 'F',
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
      afrmvTarget: wo.emissionsReadings.afrmvTarget,
      catalystTempPre: wo.emissionsReadings.catalystTempPre,
      catalystTempPost: wo.emissionsReadings.catalystTempPost,
      permitNumber: wo.emissionsReadings.permitNumber,

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
}

function formatLaborCodeTime(lc) {
  var min = (lc.hours*60) + lc.minutes;
  return min.toString();
}
