/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');
var PartEnumerationHelper = require('../helpers/enumeration.js');

/* Declaration
----------------------------------------------------------------------------- */
var UnitSchema = new mongoose.Schema({

  netsuiteId: { type: String },

  number:         { type: String, required: true, index: { unique: true } },

  productSeries:  { type: String },

  setDate:        { type: Date },
  releaseDate:    { type: Date },

  engineSerial:         { type: String },
  compressorSerial:     { type: String },
  locationName:         { type: String },
  legalDescription:     { type: String },
  county:         { type: ObjectId, ref: 'Counties', autopopulate: true },
  state:          { type: ObjectId, ref: 'States', index: true, autopopulate: true},

  //Customer:       { type: ObjectId, ref: 'Customers', index: true, autopopulate: true },
  customerName:   { type: String },
  countyName:{type: String},
  stateName: {type: String},
  assignedTo:     { type: ObjectId, ref: 'Users', index: true },
  updated_at: { type: Date, required: true }

});
UnitSchema.plugin(autopopulate);
UnitSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
UnitSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
UnitSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("Units", UnitSchema);