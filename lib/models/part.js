/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');
var PartEnumerationHelper = require('../helpers/enumeration.js');

/* Declaration
----------------------------------------------------------------------------- */
var PartSchema = new mongoose.Schema({

  netsuiteId:     { type: Number },
  description:    { type: String },
  componentName:  { type: String },
  system:         { type: Number },
  subsystem:      { type: Number },
  engine:         { type: Number },
  compressor:     { type: Number },
  component:      { type: Number },
  revision:       { type: Number },

  vendors: [{
    vendor: { type: ObjectId, ref: 'Vendor', index: true },
    vendorPartNumber:       { type: String },
    vendorPartCost:         { type: Number},
    vendorPartDescription:  { type: String }
  }],
  updated_at: { type: Date, required: true }

});
PartSchema.plugin(autopopulate);
PartSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
PartSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
PartSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

PartSchema.virtual('smartPartNumber')
.get(function () {
  return PartEnumerationHelper.smartPartNumber(this);
});

PartSchema.virtual('systemName')
.get(function () {
  return PartEnumerationHelper.systemName(this);
});

PartSchema.virtual('subsystemName')
.get(function () {
  return PartEnumerationHelper.subsystemName(this);
});

PartSchema.virtual('engineName')
.get(function () {
  return PartEnumerationHelper.engineName(this);
});

PartSchema.virtual('compressorName')
.get(function () {
  return PartEnumerationHelper.compressorName(this);
});

PartSchema.virtual('subsystemConcatenateName')
.get(function () {
  return PartEnumerationHelper.subsystemConcatenateName(this);
});

PartSchema.virtual('concatenateName')
.get(function () {
  return PartEnumerationHelper.concatenateName(this);
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Parts', PartSchema);