/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var WorkOrderSchema = new mongoose.Schema({

  timeStarted: { type: Date },
  timeSubmitted: { type: Date },
  timeApproved: { type: Date },

  types: {
    pm:         { type: Boolean },
    corrective: { type: Boolean },
    trouble:    { type: Boolean },
    newset:     { type: Boolean },
    release:    { type: Boolean },
    indirect:   { type: Boolean }
  },

  header: {
    unitNumber: { type: ObjectId, ref: 'Units', index: true, autopopulate: true },
    customerName:     { type: String },
    contactName:      { type: String },
    county:           { type: String },
    state:            { type: String },
    leaseName:        { type: String },
    rideAlong:        { type: String },
    mileage:          { type: String },
    applicationtype:  { type: String }
  },

  unitOwnership: {
    isRental: { type: Boolean },
    isCustomerUnit: { type: Boolean }
  },

  billingInfo: {
    billableToCustomer: { type: Boolean },
    warrantyWork:       { type: Boolean },
    AFE:                { type: Boolean }
  },

  misc: {
    leaseNotes: { type: String },
    unitNotes:  { type: String },
    JSA:        { type: String },

    typeOfAsset:              { type: String },
    isUnitRunningOnDeparture: { type: Boolean }
  },



  // TODO: double check data types
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
      driveLine:          { type: Boolean }
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
      oilPumpBelt:          { type: Boolean }
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
      safety:         { hours: { type: Number }, minutes: { type: Number } },
      lunch:          { hours: { type: Number }, minutes: { type: Number } },
      custRelations:  { hours: { type: Number }, minutes: { type: Number } },
      telemetry:      { hours: { type: Number }, minutes: { type: Number } },
      environmental:  { hours: { type: Number }, minutes: { type: Number } },
      diagnostic:     { hours: { type: Number }, minutes: { type: Number } },
      serviceTravel:  { hours: { type: Number }, minutes: { type: Number } },
      optimizeUnit:   { hours: { type: Number }, minutes: { type: Number } },
      pm:             { hours: { type: Number }, minutes: { type: Number } },
      washUnit:       { hours: { type: Number }, minutes: { type: Number } },
      training:       { hours: { type: Number }, minutes: { type: Number } },
    },

    engine: {
      oilAndFilter:     { hours: { type: Number }, minutes: { type: Number } },
      addOil:           { hours: { type: Number }, minutes: { type: Number } },
      compression:      { hours: { type: Number }, minutes: { type: Number } },
      replaceEngine:    { hours: { type: Number }, minutes: { type: Number } },
      replaceCylHead:   { hours: { type: Number }, minutes: { type: Number } },
      replaceRadiator:  { hours: { type: Number }, minutes: { type: Number } },
      fuelSystem:       { hours: { type: Number }, minutes: { type: Number } },
      ignition:         { hours: { type: Number }, minutes: { type: Number } },
      starter:          { hours: { type: Number }, minutes: { type: Number } },
      lubrication:      { hours: { type: Number }, minutes: { type: Number } },
      exhaust:          { hours: { type: Number }, minutes: { type: Number } },
      alternator:       { hours: { type: Number }, minutes: { type: Number } },
      driveOrCoupling:  { hours: { type: Number }, minutes: { type: Number } },
      sealsAndGaskets:  { hours: { type: Number }, minutes: { type: Number } },
    },
    emissions: {
      install: { hours: { type: Number }, minutes: { type: Number } },
      test:    { hours: { type: Number }, minutes: { type: Number } },
      repair:  { hours: { type: Number }, minutes: { type: Number } }
    },
    panel: {
      panel:         { hours: { type: Number }, minutes: { type: Number } },
      electrical:    { hours: { type: Number }, minutes: { type: Number } }
    },
    compressor: {
      inspect:  { hours: { type: Number }, minutes: { type: Number } },
      replace:  { hours: { type: Number }, minutes: { type: Number } }
    },
    cooler: {
      cooling:  { hours: { type: Number }, minutes: { type: Number } }
    },
    vessel: {
      dumpControl:  { hours: { type: Number }, minutes: { type: Number } },
      reliefValve:  { hours: { type: Number }, minutes: { type: Number } },
      suctionValve: { hours: { type: Number }, minutes: { type: Number } }
    },
  },

  parts: [{
    number:       { type: String },
    description:  { type: String },
    cost:         { type: Number },
    laborCode:    { type: String },
    quantity:     { type: String },
    isBillable:   { type: Boolean },
    isWarranty:   { type: Boolean },
  }],


  updated_at: { type: Date, required: true }

});
WorkOrderSchema.plugin(autopopulate);
WorkOrderSchema.set('toJSON', {getters: true, virtuals: true });
WorkOrderSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
WorkOrderSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
WorkOrderSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('WorkOrders', WorkOrderSchema);
