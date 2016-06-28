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

  workOrderSchema.methods.populateCustomerByName = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      if(!self.header.customerName) return reject(new Error("Missing customerName on Workorder to populate"));

      Customer.findOne({name: self.header.customerName}).lean().exec()
        .then(function (cust) {
          self.customer = cust;

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
    pm : "" ,
    techId : "" ,

    //header
    unitNumber : "" ,
    customerName : "" ,
    contactName : "" ,
    county : "" ,
    state : "" ,
    leaseName : "" ,
    rideAlong : "" ,
    startMileage : "",
    endMileage : "",

    isUnitRunningOnDeparture : "" ,

    //unit ownership
    isCustomerUnit : "" ,
    isRental : "" ,

    //billing info
    billableToCustomer : "" ,
    warrantyWork : "" ,
    AFE: "" ,

    //pm check list
    lowDischargeKill : "" ,
    highSuctionKill : "" ,
    highDischargeKill : "" ,
    lowSuctionKill: "" ,
    highDischargeTempKill : "" ,

    //engine checks
    battery : "" ,
    capAndRotor : "" ,
    airFilter : "",
    oilAndFilters : "",
    magPickup : "",
    belts : "",
    guardsAndBrackets : "",
    sparkPlugs : "",
    plugWires : "",

    //general checks
    kills : "",
    airHoses : "",
    coolerForCracks : "",
    coolerLouverMovement : "",
    coolerLouverCleaned : "",
    scrubberDump : "",
    plugInSkid : "",
    filledDayTank : "",
    fanForCracking : "",
    panelWires : "",
    oilPumpBelt : "",
    fuelPressureFirstCut : "",
    fuelPressureSecondCut : "",
    visibleLeaksNotes : "",

    //engine compression
    cylinder1 : "",
    cylinder2 : "",
    cylinder3 : "",
    cylinder4 : "",
    cylinder5 : "",
    cylinder6 : "",
    cylinder7 : "",
    cylinder8 : "",

    //unit readings
    suctionPressure : "",
    dischargePressure : "",
    flowMCF : "",
    rpm : "",
    dischargeTemp1 : "",
    dischargeTemp2 : "",
    hourReading : "",
    compressorSerial : "",
    engineSerial : "",
    engineOilPressure : "",
    alternatorOutput : "",
    compressorOilPressure : "",
    engineJWTemp : "",
    engineManifoldVac : "",

    afrmvTarget : "" ,
    catalystTempPre : "" ,
    catalystTempPost : "" ,
    permitNumber  : "" ,

    //comments
    repairsDescription : "" ,
    repairsReason  : "" ,
    calloutReason : "" ,
    newsetNotes : "" ,
    releaseNotes : "" ,
    indirectNotes : "" ,
    timeAdjustmentNotes  : "" ,

    //misc
    leaseNotes : "",
    unitNotes : "" ,

    //labor codes
    //basic
    safety : "",
    positiveAdj : "",
    negativeAdj : "",
    lunch : "",
    custRelations : "",
    telemetry : "",
    environmental : "",
    diagnostic : "",
    serviceTravel : "",
    optimizeUnit : "",
    washUnit : "",
    training : "",

    //engine labor codes
    oilAndFilter : "",
    addOil : "",
    compression : "",
    replaceEngine : "",
    replaceCylHead : "",
    replaceRadiator : "",
    fuelSystem : "",
    ignition : "",
    starter : "",
    lubrication : "",
    exhaust : "",
    alternator : "",
    driveOrCoupling : "",
    sealsAndGaskets : "",

    //emissions labor codes
    install : "",
    test : "",
    repair : "",

    //panel labor codes
    panel : "",
    electrical : "",

    //compressor labor codes
    inspect : "",
    replace : "",

    //cooler labor codes
    cooling : "",

    //vessel labor codes
    dumpControl : "",
    reliefValve : "",
    suctionValve : ""
  };
}
