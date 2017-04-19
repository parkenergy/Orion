/* Manager
 --- workOrderSchema ---

 An order of work information


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  request       = require('request-promise'),
  Unit          = require('../models/unit'),
  User          = require('../models/user'),
  Customer      = require('../models/customer'),
  EditHistory   = require('../models/editHistory'),
  _             = require('lodash'),
  diff          = require('deep-diff').diff,
  log           = require('../helpers/logger'),
  Promise       = require('bluebird'),
  ClientError   = require('../errors/client'),
  AuthError     = require('../errors/auth'),
  ServerError   = require('../errors/server');

module.exports = function (workOrderSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  workOrderSchema.statics.createDoc = function (data) {
    return new Promise( (resolve, reject) => {

      let dataArr = [].concat(data); //Ensure data is an array, cast single object to array

      //clean data
      dataArr.forEach((doc) => {
        delete doc._id;
        delete doc.__v;

        // SETS ALL TYPES TO NULL AND SETS PM TO TRUE FOR ALL
        //Set to PM type if `pm` is true and `type` is empty
        //doc.type = doc.type || doc.pm ? 'PM' : null;
      });

      //Promise chain
      Promise.join(
        //Populate user/tech
        User.find({
          username: {
            $in: _.map(dataArr, 'techId')
          }
        }).select('_id username'),
        //Populate unit
        Unit.find({
          netsuiteId: {
            $in: _.map(dataArr, _.property('unit.netsuiteId'))
          }
        }).select('_id netsuiteId'),
        (techDocs, unitDocs) => {
          dataArr = dataArr.map( (doc) =>  {
            const tech = _.find(techDocs, (o) => {
              return doc.techId === o.username;
            });

            const unit = _.find(unitDocs, (o) => {
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
        .then((docs) => this.insertMany(docs))
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  workOrderSchema.statics.updateDoc = function (id, data, identity) {

    log.info({id}, "Update Doc");
    return new Promise( (resolve, reject) => {
      if(!identity) return reject(new AuthError("Not authenticated"));
      if(identity.role !== 'admin') return reject(new AuthError("You do not have privileges to do that"));
      if(typeof id === "string") id = ObjectId(id);

      if(data.netsuiteSyned && !data.timeSynced && !data.syncedBy) {
        log.trace({netsuiteSync: data.netsuiteSyned, id}, "Is Submitting to netsuite?");

        this.findById(id)
          .exec()
          .then( (doc) =>  {
            if(doc.netsuiteSync) throw ClientError("Workorder Already Synced");
            if(doc.type === "Indirect") throw ClientError("Indirects Cannot Be Synced");
            log.trace("Found document to sync");
            return syncToNetsuite(doc);
          })
          .then( (doc) =>  {
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


    return new Promise( (resolve, reject) => {
      if(!identity) return reject(new AuthError("Not Authenticated"));
      if(typeof id === "string") id = ObjectId(id);
      this.findById(id)
        .exec()
        .then((oldData) => {
          if(oldData) {
            oldData = JSON.parse(JSON.stringify(oldData));
            if(typeof newData.technician === 'object') newData.technician = oldData.technician;
          }

          return diff(oldData, newData) || [];
        })
        .map((change) => {
          const type =
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
        .filter((edit) => {
          return !((edit.path.length === 0)    ||
          (edit.path[0] === 'timePosted')      ||
          (edit.path[0] === "comments")        ||
          (edit.path[0] === "unit")            ||
          (edit.path[0] === "_id")             ||
          (edit.editType === "Add")            ||
          (edit.path[3] === "highlight")       ||
          (edit.path[0] === "managerApproved") ||
          (edit.path[0] === "unitNumber"));
        })
        .then((docs) => {
          log.trace(docs);
          if(docs.length > 0){
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


    return new Promise( (resolve, reject) => {
      if(!identity) return reject(new AuthError("Not authenticated"));
      if(identity.role !== 'admin' && identity.role !== 'manager') return reject(new AuthError("You do not have privileges to do that"));
      if(typeof id === "string") id = ObjectId(id);

      this.findByIdAndUpdate(id, {$set: {approvedBy: identity.username, timeApproved: new Date(), managerApproved: true}})
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  workOrderSchema.statics.fetch = function (id) {


    return new Promise( (resolve, reject) => {
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

      const Q = queryConstructor(options,userQuery,query);
      query = Q.query;
      userQuery = Q.userQuery;

      if(userQuery){
        User.find(userQuery, {username: 1})
            .exec()
            .then(users => {
              let ids = _.map(users, 'username');

              if(options.supervised.length > 0){
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

    return new Promise( (resolve, reject) => {
      //query object
      let query = {};
      let userQuery = null;

      const Q = queryConstructor(options,userQuery,query);
      query = Q.query;
      userQuery = Q.userQuery;

      //query models
      if(options.report) {
        this.timeReport(query)
          .then(resolve)
          .catch(reject);
      }
      else if(userQuery){
        User.find(userQuery, {username: 1})
          .exec()
          .then((users) => {
            log.trace({users: users}, "Query technicians by name");
            let ids = _.map(users, 'username');

            if (options.supervised.length > 0) {
              //ids = _.intersectionWith(ids, options.supervised, _.isEqual);
              ids = _.intersection(ids, options.supervised);
          }

            log.trace({ids: ids}, "IDs of users");

            query.techId = {$in: ids};

            log.trace({query: query}, "Query workorders");
            if(options.report) {
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
    return new Promise( (resolve, reject) => {
      if(!identity) return reject(new AuthError("Not authenticated"));
      if(typeof id === 'string') id = ObjectId(id);

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

  //Generate a time report for technicians
  workOrderSchema.statics.timeReport = function (query) {


    return new Promise( (resolve, reject) => {
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
            .reduce((a, b) => { return a+b }, 0);

          const minLogged = report.times
            .map((timeObj) => {
              if(!timeObj.timeStarted && !timeObj.timeSubmitted) return 0;

              // Ensure they are date objects
              const timeStarted = timeObj.timeStarted;
              const timeSubmitted = timeObj.timeSubmitted;

              // Get difference in minutes
              return (timeSubmitted.getTime() - timeStarted.getTime()) / 1000 / 60;
            })
            .reduce((a, b) => { return a+b }, 0);

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
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Get WorkOrders for Unit
  workOrderSchema.statics.getUnitWorkOrders = function (unit, num) {
    return new Promise((resolve, reject) => {
      if(!unit) return reject(new ClientError("Missing  Unit Number"));

      const options = {
        sort: '-timeSubmitted',
        unit,
        limit: num,
        skip: 0
      };

      this.list(options)
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

const populateTechByTechId = wo => {
  return new Promise( (resolve, reject) => {
    wo = wo.toObject();
    User.findOne({username: wo.techId})
      .lean()
      .exec()
      .then(tech => {
        wo.technician = tech;
        return wo;
      })
      .then(resolve)
      .catch(reject)
  });
};

const populateCustomerByName = wo => {

  log.trace("populate customer by name");

  return new Promise( (resolve, reject) => {
    /*if(!wo.header.customerName) return reject(new ClientError("Missing customerName on Workorder to populate"));*/

    Customer.findOne({name: wo.header.customerName})
      .lean()
      .exec()
      .then((cust) => {
        log.trace({customer: cust}, "Customer Found");
        wo.customer = cust || null;
        if(wo.customer === null){
          wo.customer = { netSuiteId: ''};
        }

        return wo;
      })
      .then(resolve)
      .catch(reject);
  });
};

const syncToNetsuite = doc => {

  log.trace("Sync to netsuite1");
  return new Promise( (resolve, reject) => {
    if(!doc.header.unitNumberNSID) {
      doc.header.unitNumberNSID = doc.unit.netsuiteId;
    }

    if(!doc.header.unitNumberNSID) {
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
            'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion~2017~',
            'User-Agent' : 'SuiteScript-Call'
          },
          json: nswo
        });
      })
      .then((resp) => {
        log.trace({response: resp}, "Netsuite Response");
        if(!resp.nswoid) throw(new ClientError("POSTing Workorder to Netsuite failed!"));

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
      if((k !== 'negativeAdj') && (k !== 'positiveAdj')) {
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

      woStarted:typeof wo.timeStarted === 'object' ? wo.timeStarted.toISOString() : wo.timeStarted,
      woEnded: typeof  wo.timeSubmitted === 'object' ? wo.timeSubmitted.toISOString() : wo.timeSubmitted,

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
  if(options.unit) query.unitNumber = options.unit;

  if(options.tech) {
    userQuery = {$text: {$search: options.tech}};
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
    //query['billingInfo.billed'] = false;
  }

  if(options.billed){
    query['billingInfo.billed'] = true;
  }

  if(options.billParts) {
    query.parts = {
      $elemMatch: {
        isBillable: true
      }
    };
  }

  if(options.hasOwnProperty('synced')){
    query.netsuiteSyned = options.synced;
  }

  //Filter by approved and/or unapproved
  let filterApproval = (!options.approved && !options.unapproved);
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
    query.timeSubmitted = {
      $gte: options.from,
      $lte: options.to || new Date()
    };
  }

  if(options.supervised && options.supervised.length > 0) {
    query.techId = {$in: options.supervised};
  }

  return { options, userQuery, query }
};

const formatLaborCodeTime = lc => {
  const min = (lc.hours*60) + lc.minutes;
  return min.toString();
};
