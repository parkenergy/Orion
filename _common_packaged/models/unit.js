/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');
var PartEnumerationHelper = require('../helpers/enumeration.js');

/* Declaration
----------------------------------------------------------------------------- */
var UnitSchema = new mongoose.Schema({

  netSuitId: { type: String },

  number:         { type: String, required: true, index: { unique: true } },

  productSeries:  { type: Number },

  setDate:        { type: Date },
  releaseDate:    { type: Date },

  engineSerial:         { type: String },
  compressorSerial:     { type: String },
  locationName:         { type: String },

  customer:       { type: ObjectId, ref: 'Customer', index: true, autopopulate: true },
  assignedTo:     { type: ObjectId, ref: 'User', index: true },

});
UnitSchema.plugin(autopopulate);

/* Virtual Fields
----------------------------------------------------------------------------- */
UnitSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("Units", UnitSchema);
