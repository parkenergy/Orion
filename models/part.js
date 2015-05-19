var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var PartSchema = new mongoose.Schema({

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
  }]

});

// TODO: Add virtual fields for the following values

/* Example
--------------------------------------------------------------------------------
PartSchema.virtual('fullName')
.get(function () {
  return this.name.first + ' ' + this.name.last;
});
----------------------------------------------------------------------------- */

/* Fields
--------------------------------------------------------------------------------
  smartPartNumber
  systemName
  subsystemName
  engineName
  compressorName
  subsystemConcatenateName
  concatenateName
----------------------------------------------------------------------------- */

module.exports = mongoose.model('Parts', PartSchema);
