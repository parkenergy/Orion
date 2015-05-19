/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var PartEnumerationHelper = require('../helpers/enumeration.js');

/* Declaration
----------------------------------------------------------------------------- */
var UnitSchema = new mongoose.Schema({

  number:         { type: String, required: true, index: { unique: true } },

  productType:    { type: Number },
  productSeries:  { type: Number },

  setDate:        { type: Date },
  releaseDate:    { type: Date },

  pressureRating: { type: String, enum: ["Low", "High"] },
  pressureLimit:  { type: Number },
  
  isUpgraded:     { type: Boolean },
  dateUpgraded:   { type: Date },

  status: {
    type: String,
    enum: ["Active Lease", "Active Test", "Idle Available", "Idle Committed"],
    default: "Idle Available"
  },

  engine:         { type: ObjectId, ref: 'Engine', index: true},
  compressor:     { type: ObjectId, ref: 'Compressor', index: true },

  customer:       { type: ObjectId, ref: 'Customer', index: true },
  location:       { type: ObjectId, ref: 'Location', index: true },

  assignedTo:     { type: ObjectId, ref: 'User', index: true },

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("Units", UnitSchema);
