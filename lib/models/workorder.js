/* Includes
 ----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var autopopulate = require('mongoose-autopopulate');
var _ = require("underscore");

/* Declaration
 ----------------------------------------------------------------------------- */
var WorkOrderSchema = new mongoose.Schema({

  timeStarted: { type: Date, index: true },
  timeSubmitted: { type: Date },
  timeApproved: { type: Date },

  pm:    { type: Boolean },
  type: { type: String },

  header: {
    unitNumber:       { type: String },
    customerName:     { type: String },
    contactName:      { type: String },
    county:           { type: String },
    state:            { type: String },
    leaseName:        { type: String },
    rideAlong:        { type: String },
    startMileage:     { type: String },
    endMileage:       { type: String },
    applicationtype:  { type: String }
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
      cylinder8: { type: String },
    }
  },

  comments: {
    repairsDescription:  { type: String },
    repairsReason:       { type: String },
    calloutReason:       { type: String },
    newsetNotes:         { type: String },
    releaseNotes:        { type: String },
    indirectNotes:       { type: String },
    timeAdjustmentNotes: { type: String },
  },

  laborCodes: {
    basic: {
      safety:         { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      positiveAdj:    { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      negativeAdj:    { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      lunch:          { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      custRelations:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      telemetry:      { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      environmental:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      diagnostic:     { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      serviceTravel:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      optimizeUnit:   { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      pm:             { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      washUnit:       { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      training:       { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },

    engine: {
      oilAndFilter:     { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      addOil:           { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      compression:      { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      replaceEngine:    { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      replaceCylHead:   { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      replaceRadiator:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      fuelSystem:       { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      ignition:         { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      starter:          { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      lubrication:      { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      exhaust:          { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      alternator:       { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      driveOrCoupling:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      sealsAndGaskets:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },
    emissions: {
      install: { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      test:    { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      repair:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },
    panel: {
      panel:         { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      electrical:    { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },
    compressor: {
      inspect:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      replace:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },
    cooler: {
      cooling:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },
    vessel: {
      dumpControl:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      reliefValve:  { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
      suctionValve: { hours: { type: Number }, minutes: { type: Number }, text: {type: String} },
    },
  },

  parts: [{
    isWarranty: {type: Boolean, default: false},
    isBillable: {type: Boolean, default: false},
    isManual: {type: Boolean, default: false},
    quantity: {type: Number, required: true},
    laborCode: String,
    cost: Number,
    description: String
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
      confinedSpace:          { type: Boolean },
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
      fireExtinguisher:           { type: Boolean },
    },
    hazardPlanning: { type: String },
    agree:          { type: Boolean },
    techinicians:   [{ tech: { type: String }}]
  },

  unitNumber: { type: String },
  unit: { type: ObjectId, ref: 'Units', autopopulate: true },
  technician: { type: ObjectId, ref: 'Users', index: true, autopopulate: true },
  techId: { type: String},
  newEngineSerial: { type: String},
  newCompressorSerial: {type: String},

  isSynced: { type: Boolean },

  updated_at: { type: Date, required: true, index: true }

});
WorkOrderSchema.plugin(autopopulate);
WorkOrderSchema.set('toJSON', {getters: true, virtuals: true });
WorkOrderSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
// WorkOrderSchema.pre('update', function(done) {
//   this.updated_at = new Date();
//   done();
// });

/* Virtual Fields
 ----------------------------------------------------------------------------- */
WorkOrderSchema.virtual('createdOn')
  .get(function () {
    return new Date(this._id.getTimestamp());
  });

WorkOrderSchema.virtual('orderType')
  .get(function() {
    if((!this.type || this.type === "") && this.pm) {
      return 'pm';
    }
    return this.type;
  });

//total times for review
/*WorkOrderSchema.virtual('totalTimes').get(function() {
  if(!this.timeStarted && !this.timeSubmitted) return null;/

  var start = this.timeStarted.getTime(),
    end   = this.timeSubmitted.getTime();

  var negMin = (this.laborCodes.basic.negativeAdj.hours * 60) + this.laborCodes.basic.negativeAdj.minutes;

  var posMin = (this.laborCodes.basic.positiveAdj.hours * 60) + this.laborCodes.basic.positiveAdj.minutes;

  var selectedMin = _.mapObject(this.laborCodes, function(category) {
      return _.mapObject(category, function(code, key) {
        if(key === 'positiveAdj' || key === 'negativeAdj') return 0;

        return (code.hours * 60) + code.minutes;
      }).reduce(function(a, b) { return a+b; });
    }).reduce(function(a, b) { return a+b; }) - negMin + posMin;

  if(!selectedMin || selectedMin == 0) return null;

  var totalMin = Math.abs(start - end) / 60000;

  var unaccountedMin = totalMin - selectedMin;

  return {
    total: minToTime(totalMin),
    selected: minToTime(selectedMin),
    unaccounted: minToTime(unaccountedMin)
  };
});*/

//convert minutes to object with `hours` and `minutes` properties
function minToTime(min) {
  var hours = Math.floor(min / 60),
    minutes = min % 60;

  //create string representation
  var str = pad(hours, 2) + pad(minutes, 2);

  return {
    hours: hours,
    minutes: minutes,
    human: str
  };
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/* Middleware
 ----------------------------------------------------------------------------- */
WorkOrderSchema.pre('save', function(next) {
  if((!this.type || this.type === "") && this.pm) {
    this.type='pm';
    next();
  }
});

/* Exports
 ----------------------------------------------------------------------------- */
module.exports = mongoose.model('WorkOrders', WorkOrderSchema);
