/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var WorkOrderSchema = new mongoose.Schema({

  types: {
    pm:         { type: Boolean },
    corrective: { type: Boolean },
    trouble:    { type: Boolean },
    newset:     { type: Boolean },
    release:    { type: Boolean }
  },

  header: {
    unitNumber:       { type: String },
    customerName:     { type: String },
    contactName:      { type: String },
    county:           { type: String },
    state:            { type: String },
    leaseName:        { type: String },
    rideAlong:        { type: String },
    mileage:          { type: String },
    applicationType:  { type: String }
  },

  unitOwnership: {
    isRental: { type: Boolean }
  },

  billingInfo: {
    billableToCustomer: { type: Boolean },
    warrantyWork:       { type: Boolean },
    AFE:                { type: Boolean }
  },

  leaseNotes: { type: String },
  unitNotes:  { type: String },
  JSA:        { type: String },

  typeOfAsset:              { type: String },
  isUnitRunningOnDeparture: { type: Boolean },

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
      sparkPlugskey:      { type: Boolean },
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
      oilDump:              { type: Boolean }
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

  unit: { type: ObjectId, ref: 'Units', index: true },
  customer: { type: ObjectId, ref: 'Customers', index: true },
  worker: { type: ObjectId, ref: 'Users', index: true },
  county: { type: ObjectId, ref: 'Counties', index: true },
  lease: { type: ObjectId, ref: 'Lease', index: true },

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('WorkOrders', WorkOrderSchema);
