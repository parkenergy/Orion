/* Model
--- WorkOrder ---

An order of work information


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose   = require('mongoose'),
  _            = require('lodash'),
  autopopulate = require('mongoose-autopopulate'),
  log          = require('../helpers/logger'),
  ObjectId     = mongoose.Schema.ObjectId;

var log = require('../helpers/logger');

//Construct Schema
var workOrderSchema = new mongoose.Schema({

  clientVersion: { type: String },
  timeStarted: { type: Date },
  timeSubmitted: { type: Date, index: true },
  timeApproved: { type: Date },

  pm:    { type: Boolean },
  type: { type: String },

  header: {
    unitNumber:       { type: String },
    unitNumberNSID:   { type: String },
    customerName:     { type: String, index: true },
    contactName:      { type: String },
    county:           { type: String },
    state:            { type: String },
    leaseName:        { type: String, index: true },
    rideAlong:        { type: String, default: '' },
    startMileage:     { type: String, default: '' },
    endMileage:       { type: String, default: '' },
    applicationtype:  { type: String, default: '' }
  },

  unitOwnership: {
    isRental: { type: Boolean },
    isCustomerUnit: { type: Boolean }
  },

  billingInfo: {
    billableToCustomer: { type: Boolean },
    warrantyWork:       { type: Boolean },
    AFE:                { type: Boolean },
    AFENumber:          { type: String}
  },

  misc: {
    leaseNotes: { type: String },
    unitNotes:  { type: String },

    typeOfAsset:              { type: String },
    isUnitRunningOnDeparture: { type: Boolean }
  },

  unitReadings: {
    suctionPressure:        { type: String },
    dischargePressure:      { type: String },
    flowMCF:                { type: String },
    rpm:                    { type: String },
    dischargeTemp1:         { type: String },
    dischargeTemp2:         { type: String },
    hourReading:            { type: String },
    compressorSerial:       { type: String },
    engineSerial:           { type: String },
    engineOilPressure:      { type: String },
    alternatorOutput:       { type: String },
    compressorOilPressure:  { type: String },
    engineJWTemp:           { type: String },
    engineManifoldVac:      { type: String }
  },

  emissionsReadings: {
    afrmvTarget:      { type: String },
    catalystTempPre:  { type: String },
    catalystTempPost: { type: String },
    permitNumber:     { type: String }
  },

  pmChecklist: {
    killSettings: {
      highSuctionKill:        { type: String },
      highDischargeKill:      { type: String },
      lowSuctionKill:         { type: String },
      lowDischargeKill:       { type: String },
      highDischargeTempKill:  { type: String }
    },
    engineChecks: {
      battery:            { type: Boolean },
      capAndRotor:        { type: Boolean },
      airFilter:          { type: Boolean },
      oilAndFilters:      { type: Boolean },
      magPickup:          { type: Boolean },
      belts:              { type: Boolean },
      guardsAndBrackets:  { type: Boolean },
      sparkPlugs:         { type: Boolean },
      plugWires:          { type: Boolean },
      driveLine:          { type: Boolean },
      batteryNa:            { type: Boolean },
      capAndRotorNa:        { type: Boolean },
      airFilterNa:          { type: Boolean },
      oilAndFiltersNa:      { type: Boolean },
      magPickupNa:          { type: Boolean },
      beltsNa:              { type: Boolean },
      guardsAndBracketsNa:  { type: Boolean },
      sparkPlugsNa:         { type: Boolean },
      plugWiresNa:          { type: Boolean },
      driveLineNa:          { type: Boolean }
    },
    generalChecks: {
      kills:                { type: Boolean },
      airHoses:             { type: Boolean },
      coolerForCracks:      { type: Boolean },
      coolerLouverMovement: { type: Boolean },
      coolerLouverCleaned:  { type: Boolean },
      scrubberDump:         { type: Boolean },
      plugInSkid:           { type: Boolean },
      filledDayTank:        { type: Boolean },
      fanForCracking:       { type: Boolean },
      panelWires:           { type: Boolean },
      oilPumpBelt:          { type: Boolean },
      killsNa:                { type: Boolean },
      airHosesNa:             { type: Boolean },
      coolerForCracksNa:      { type: Boolean },
      coolerLouverMovementNa: { type: Boolean },
      coolerLouverCleanedNa:  { type: Boolean },
      scrubberDumpNa:         { type: Boolean },
      plugInSkidNa:           { type: Boolean },
      filledDayTankNa:        { type: Boolean },
      fanForCrackingNa:       { type: Boolean },
      panelWiresNa:           { type: Boolean },
      oilPumpBeltNa:          { type: Boolean }
    },
    fuelPressureFirstCut:   { type: String },
    fuelPressureSecondCut:  { type: String },
    visibleLeaksNotes:      { type: String },
    engineCompression: {
      cylinder1: { type: String },
      cylinder2: { type: String },
      cylinder3: { type: String },
      cylinder4: { type: String },
      cylinder5: { type: String },
      cylinder6: { type: String },
      cylinder7: { type: String },
      cylinder8: { type: String }
    }
  },

  comments: {
    repairsDescription:  { type: String },
    repairsReason:       { type: String },
    calloutReason:       { type: String },
    newsetNotes:         { type: String },
    releaseNotes:        { type: String },
    indirectNotes:       { type: String },
    timeAdjustmentNotes: { type: String }
  },

  laborCodes: {
    basic: {
      safety:         { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      positiveAdj:    { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      negativeAdj:    { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      lunch:          { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      custRelations:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      telemetry:      { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      environmental:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      diagnostic:     { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      serviceTravel:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      optimizeUnit:   { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      pm:             { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      washUnit:       { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      training:       { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    },

    engine: {
      oilAndFilter:     { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      addOil:           { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      compression:      { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      replaceEngine:    { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      replaceCylHead:   { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      replaceRadiator:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      fuelSystem:       { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      ignition:         { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      starter:          { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      lubrication:      { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      exhaust:          { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      alternator:       { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      driveOrCoupling:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      sealsAndGaskets:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    },
    emissions: {
      install: { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      test:    { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      repair:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    },
    panel: {
      panel:         { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      electrical:    { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    },
    compressor: {
      inspect:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      replace:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      addOil:   { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    },
    cooler: {
      cooling:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    },
    vessel: {
      dumpControl:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      reliefValve:  { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} },
      suctionValve: { hours: { type: Number, default:0 }, minutes: { type: Number, default:0 }, text: {type: String} }
    }
  },

  parts: [{
    vendor: {type: String},
    number: {type: String},
    isWarranty: {type: Boolean, default: false},
    isBillable: {type: Boolean, default: false},
    isManual: {type: Boolean, default: false},
    quantity: {type: Number, required: true},
    laborCode: String,
    cost: Number,
    description: String,
    netsuiteId: String
  }],

  jsa: {
    location:           { type: String },
    customer:           { type: String },
    descriptionOfWork:  { type: String },
    emergencyEvac:      { type: String },
    potentialHazards: {
      bodyPosition:           { type: Boolean },
      pinch:                  { type: Boolean },
      crushOrStriking:        { type: Boolean },
      sharpEdges:             { type: Boolean },
      materialHandling:       { type: Boolean },
      environmental:          { type: Boolean },
      lifting:                { type: Boolean },
      elevatedBodyTemp:       { type: Boolean },
      h2s:                    { type: Boolean },
      hotColdSurfaces:        { type: Boolean },
      laceration:             { type: Boolean },
      chemExposure:           { type: Boolean },
      fallFromElevation:      { type: Boolean },
      slickSurfaces:          { type: Boolean },
      excavation:             { type: Boolean },
      slips:                  { type: Boolean },
      trips:                  { type: Boolean },
      falls:                  { type: Boolean },
      equipment:              { type: Boolean },
      fireExplosionPotential: { type: Boolean },
      eletricShock:           { type: Boolean },
      confinedSpace:          { type: Boolean }
    },
    controlsAndPractices:{
      confinedSpaceEntry:         { type: Boolean },
      spillKit:                   { type: Boolean },
      restrictAccess:             { type: Boolean },
      cutResistantGloves:         { type: Boolean },
      ppe:                        { type: Boolean },
      reviewEmergencyActionPlan:  { type: Boolean },
      drinkWater:                 { type: Boolean },
      electrician:                { type: Boolean },
      heatResistantGloves:        { type: Boolean },
      lockoutTagout:              { type: Boolean },
      depressurize:               { type: Boolean },
      chemGloves:                 { type: Boolean },
      siteJobOrientation:         { type: Boolean },
      samplingMonitoring:         { type: Boolean },
      equipmentCooldown:          { type: Boolean },
      fireExtinguisher:           { type: Boolean }
    },
    hazardPlanning: { type: String },
    agree:          { type: Boolean },
    techinicians:   [{ tech: { type: String }}]
  },

  netsuiteId: { type: String, default: ""},
  netsuiteSyned: { type: Boolean, default: false},
  unitNumber: { type: String, index: true },
  unit: { type: ObjectId, ref: 'Units', autopopulate: true },
  technician: { type: ObjectId, ref: 'Users', index: true },
  techId: { type: String, index: true },
  truckId: { type: String },
  newEngineSerial: { type: String},
  newCompressorSerial: {type: String},
  version: String,

  isSynced: { type: Boolean },

  updated_at: { type: Date, index: true, default: Date.now }

});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
workOrderSchema.plugin(autopopulate);

//stamp updated_at on save
workOrderSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
workOrderSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});

//Ensure order type is "pm" if `pm` is "true"
workOrderSchema.pre('save', function (next) {
  if((!this.type || this.type === "") && this.pm) {
    this.type='pm';
    next();
  }
});

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
workOrderSchema.index({updated_at: 1});

workOrderSchema.index({'header.leaseName': 1, 'header.customerName':1, unitNumber: 1, techId:1, updated_at: -1});

//workOrderSchema.index({'header.leaseName': 1, 'header.customerName':1, unitNumber: 1, techId:1, timeSubmitted: -1});

/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
workOrderSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

//Ensure order type is normalized
workOrderSchema.virtual('orderType')
  .get(function () {
    if((!this.type || this.type === "") && this.pm) {
      return 'pm';
    }
    return this.type;
  });

//Create total wo time
workOrderSchema.virtual('totalWoTime')
  .get(function(){
    var totalMin = 0;
    var lc = this.laborCodes.toObject();

    //iterate laborcode categories
    _.forIn(lc, function (v) {
      //iterate laborcodes inside category
      _.forIn(v, function (v, k) {
        //subtract negative time adjustment out of totalMin
        if(k === 'negativeAdj') {
          totalMin -= v.hours * 60;
          totalMin -= v.minutes;
        }
        else { //accumulate laborcodes into totalMin
          totalMin += v.hours * 60;
          totalMin += v.minutes;
        }
      });
    });
    //log.trace(totalMin);

    var hrs = Math.floor(totalMin / 60);
    var min = Math.abs(Math.round(totalMin % 60));
    return {hours: hrs || 0, minutes: min || 0};
  });

workOrderSchema.set('toJSON', { getters: true, virtuals: true });
workOrderSchema.set('toObject', { getters: true, virtuals: true });
/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/workOrder')(workOrderSchema);


//Export model
module.exports = mongoose.model('WorkOrders', workOrderSchema);
