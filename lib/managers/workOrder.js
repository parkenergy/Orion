/* Manager
 --- workOrderSchema ---

 An order of work information


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var mongoose = require('mongoose'),
  request    = require('request-promise'),
  ObjectId   = mongoose.Types.ObjectId,
  Unit       = require('../models/unit'),
  User       = require('../models/user'),
  Customer   = require('../models/customer'),
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

      if(data.netsuiteSyned) {
        me.findById(id, {safe: false, new: true})
          .exec()
          .then(function (doc) {
            return doc.syncToNetsuite();
          })
          .then(function (doc) {
            return doc.save();
          })
          .then(resolve)
          .catch(reject);
      }
      else {
        me.findByIdAndUpdate(id, data, {safe: false, new: true})
          .lean()
          .exec()
          .then(resolve)
          .catch(reject);
      }
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

  workOrderSchema.methods.populateCustomerByName = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(!self.header.customerName) return reject(new Error("Missing customerName on Workorder to populate"));

      Customer.findOne({name: self.header.customerName}).lean().exec()
        .then(function (cust) {
          self.customer = cust || null;

          return self;
        })
        .then(resolve)
        .catch(reject);
    });
  };

  workOrderSchema.methods.syncToNetsuite = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(self.type = "Indirect" || !self.header.unitNumberNSID) return reject(new Error("Indirect WorkOrders will not be synced"));

      self.populateCustomerByName()
        .then(netSuiteFormat)
        .then(function (wo) {
          return request.post({
            url: 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1',
            headers: {
              'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy~',
              'User-Agent' : 'SuiteScript-Call'
            },
            json: wo
          });
        })
        .then(function (resp) {
          if(!resp.nswoid) throw(new Error("POSTing Workorder to Netsuite failed!"));

          self.netsuiteId = resp.nswoid;
          self.netsuiteSyned = true;

          return self.save();
        })
        .then(resolve)
        .catch(reject);
    });
  };
};


/*** PRIVATE METHODS ***/

function netSuiteFormat(wo) {
  return {

    //FA : "",
    //WOR_ORDR : "" ,

    //main
    pm : wo.pm ? 'T' : 'F',
    techId : wo.techId,

    //header
    unitNumber : wo.header.unitNumberNSID,
    customerName : wo.customer._id,
    contactName : "",
    county : wo.header.county,
    state : wo.header.state,
    leaseName : wo.header.leaseName,
    rideAlong : wo.header.rideAlong,
    startMileage : wo.header.startMileage,
    endMileage : wo.header.endMileage,

    isUnitRunningOnDeparture : wo.misc.isUnitRunningOnDeparture ? 'T' : 'F',

    //unit ownership
    isCustomerUnit : wo.unitOwnership.isCustomerUnit ? 'T' : 'F',
    isRental : wo.unitOwnership.isRental ? 'T' : 'F',

    //billing info
    billableToCustomer : wo.billingInfo.billableToCustomer ? 'T' : 'F',
    warrantyWork : wo.billingInfo.warrantyWork ? 'T' : 'F',
    AFE: wo.billingInfo.AFE ? 'T' : 'F',

    //pm check list
    lowDischargeKill : wo.pmChecklist.killSettings.lowDischargeKill,
    highSuctionKill : wo.pmChecklist.killSettings.highSuctionKill,
    highDischargeKill : wo.pmChecklist.killSettings.highDischargeKill,
    lowSuctionKill: wo.pmChecklist.killSettings.lowSuctionKill,
    highDischargeTempKill : wo.pmChecklist.killSettings.highDischargeTempKill,

    //engine checks
    battery : wo.pmChecklist.engineChecks.battery ? 'T' : 'F',
    capAndRotor : wo.pmChecklist.engineChecks.capAndRotor ? 'T' : 'F',
    airFilter : wo.pmChecklist.engineChecks.airFilter ? 'T' : 'F',
    oilAndFilters : wo.pmChecklist.engineChecks.oilAndFilters ? 'T' : 'F',
    magPickup : wo.pmChecklist.engineChecks.magPickup ? 'T' : 'F',
    belts : wo.pmChecklist.engineChecks.belts ? 'T' : 'F',
    guardsAndBrackets : wo.pmChecklist.engineChecks.guardsAndBrackets ? 'T' : 'F',
    sparkPlugs : wo.pmChecklist.engineChecks.sparkPlugs ? 'T' : 'F',
    plugWires : wo.pmChecklist.engineChecks.plugWires ? 'T' : 'F',

    //general checks
    kills : wo.pmChecklist.generalChecks.kills ? 'T' : 'F',
    airHoses : wo.pmChecklist.generalChecks.airHoses ? 'T' : 'F',
    coolerForCracks : wo.pmChecklist.generalChecks.coolerForCracks ? 'T' : 'F',
    coolerLouverMovement : wo.pmChecklist.generalChecks.coolerLouverMovement ? 'T' : 'F',
    coolerLouverCleaned : wo.pmChecklist.generalChecks.coolerLouverCleaned ? 'T' : 'F',
    scrubberDump : wo.pmChecklist.generalChecks.scrubberDump ? 'T' : 'F',
    plugInSkid : wo.pmChecklist.generalChecks.plugInSkid ? 'T' : 'F',
    filledDayTank : wo.pmChecklist.generalChecks.filledDayTank ? 'T' : 'F',
    fanForCracking : wo.pmChecklist.generalChecks.fanForCracking ? 'T' : 'F',
    panelWires : wo.pmChecklist.generalChecks.panelWires ? 'T' : 'F',
    oilPumpBelt : wo.pmChecklist.generalChecks.oilPumpBelt ? 'T' : 'F',

    fuelPressureFirstCut : wo.pmChecklist.fuelPressureFirstCut,
    fuelPressureSecondCut : wo.pmChecklist.fuelPressureSecondCut,
    visibleLeaksNotes : wo.pmChecklist.visibleLeaksNotes,

    //engine compression
    cylinder1 : wo.pmChecklist.engineCompression.cylinder1,
    cylinder2 : wo.pmChecklist.engineCompression.cylinder2,
    cylinder3 : wo.pmChecklist.engineCompression.cylinder3,
    cylinder4 : wo.pmChecklist.engineCompression.cylinder4,
    cylinder5 : wo.pmChecklist.engineCompression.cylinder5,
    cylinder6 : wo.pmChecklist.engineCompression.cylinder6,
    cylinder7 : wo.pmChecklist.engineCompression.cylinder7,
    cylinder8 : wo.pmChecklist.engineCompression.cylinder8,

    //unit readings
    suctionPressure : wo.unitReadings.suctionPressure,
    dischargePressure : wo.unitReadings.dischargePressure,
    flowMCF : wo.unitReadings.flowMCF,
    rpm : wo.unitReadings.rpm,
    dischargeTemp1 : wo.unitReadings.dischargeTemp1,
    dischargeTemp2 : wo.unitReadings.dischargeTemp2,
    hourReading : wo.unitReadings.hourReading,
    compressorSerial : wo.unitReadings.compressorSerial,
    engineSerial : wo.unitReadings.engineSerial,
    engineOilPressure : wo.unitReadings.engineOilPressure,
    alternatorOutput : wo.unitReadings.alternatorOutput,
    compressorOilPressure : wo.unitReadings.compressorOilPressure,
    engineJWTemp : wo.unitReadings.engineJWTemp,
    engineManifoldVac : wo.unitReadings.engineManifoldVac,

    //emission readings
    afrmvTarget : wo.emissionsReadings.afrmvTarget,
    catalystTempPre : wo.emissionsReadings.catalystTempPre,
    catalystTempPost : wo.emissionsReadings.catalystTempPost,
    permitNumber  : wo.emissionsReadings.permitNumber,

    //comments
    repairsDescription : wo.comments.repairsDescription,
    repairsReason  : wo.comments.repairsReason,
    calloutReason : wo.comments.calloutReason,
    newsetNotes : wo.comments.newsetNotes,
    releaseNotes : wo.comments.releaseNotes,
    indirectNotes : wo.comments.indirectNotes,
    timeAdjustmentNotes  : wo.comments.timeAdjustmentNotes,

    //misc
    leaseNotes : wo.misc.leaseNotes,
    unitNotes : wo.misc.unitNotes,

    //labor codes
    //basic
    safety : formatLaborCodeTime(wo.laborCode.basic.safety),
    positiveAdj : formatLaborCodeTime(wo.laborCode.basic.positiveAdj),
    negativeAdj : formatLaborCodeTime(wo.laborCode.basic.negativeAdj),
    lunch : formatLaborCodeTime(wo.laborCode.basic.lunch),
    custRelations : formatLaborCodeTime(wo.laborCode.basic.custRelations),
    telemetry : formatLaborCodeTime(wo.laborCode.basic.telemetry),
    environmental : formatLaborCodeTime(wo.laborCode.basic.environmental),
    diagnostic : formatLaborCodeTime(wo.laborCode.basic.diagnostic),
    serviceTravel : formatLaborCodeTime(wo.laborCode.basic.serviceTravel),
    optimizeUnit : formatLaborCodeTime(wo.laborCode.basic.optimizeUnit),
    washUnit : formatLaborCodeTime(wo.laborCode.basic.washUnit),
    training : formatLaborCodeTime(wo.laborCode.basic.training),

    //engine labor codes
    oilAndFilter : formatLaborCodeTime(wo.laborCode.engine.oilAndFilter),
    addOil : formatLaborCodeTime(wo.laborCode.engine.addOil),
    compression : formatLaborCodeTime(wo.laborCode.engine.compression),
    replaceEngine : formatLaborCodeTime(wo.laborCode.engine.replaceEngine),
    replaceCylHead : formatLaborCodeTime(wo.laborCode.engine.replaceCylHead),
    replaceRadiator : formatLaborCodeTime(wo.laborCode.engine.replaceRadiator),
    fuelSystem : formatLaborCodeTime(wo.laborCode.engine.fuelSystem),
    ignition : formatLaborCodeTime(wo.laborCode.engine.ignition),
    starter : formatLaborCodeTime(wo.laborCode.engine.starter),
    lubrication : formatLaborCodeTime(wo.laborCode.engine.lubrication),
    exhaust : formatLaborCodeTime(wo.laborCode.engine.exhaust),
    alternator : formatLaborCodeTime(wo.laborCode.engine.alternator),
    driveOrCoupling : formatLaborCodeTime(wo.laborCode.engine.driveOrCoupling),
    sealsAndGaskets : formatLaborCodeTime(wo.laborCode.engine.sealsAndGaskets),

    //emissions labor codes
    install : formatLaborCodeTime(wo.laborCode.emissions.install),
    test : formatLaborCodeTime(wo.laborCode.emissions.test),
    repair : formatLaborCodeTime(wo.laborCode.emissions.repair),

    //panel labor codes
    panel : formatLaborCodeTime(wo.laborCode.panel.panel),
    electrical : formatLaborCodeTime(wo.laborCode.panel.electrical),

    //compressor labor codes
    inspect : formatLaborCodeTime(wo.laborCode.compressor.inspect),
    replace : formatLaborCodeTime(wo.laborCode.compressor.replace),

    //cooler labor codes
    cooling : formatLaborCodeTime(wo.laborCode.cooler.cooling),

    //vessel labor codes
    dumpControl : formatLaborCodeTime(wo.laborCode.vessel.dumpControl),
    reliefValve : formatLaborCodeTime(wo.laborCode.vessel.reliefValve),
    suctionValve : formatLaborCodeTime(wo.laborCode.vessel.suctionValve),

    //parts
    parts: wo.parts
  };
}

function formatLaborCodeTime(lc) {
  var min = (lc.hours*60) + lc.minutes;
  return min.toString();
}
