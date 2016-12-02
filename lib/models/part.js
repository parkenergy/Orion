/* Model
--- Part ---

A compressor parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('lodash'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var partSchema = new mongoose.Schema({
  netsuiteId:     { type: Number, index: true },
  description:    { type: String },
  componentName:  { type: String },
  system:         { type: Number },
  subsystem:      { type: Number },
  engine:         { type: Number },
  compressor:     { type: Number },
  component:      { type: Number },
  revision:       { type: Number },
  MPN:            { type: String },

  vendors: [{
    vendor: { type: ObjectId, ref: 'Vendor', index: true },
    vendorPartNumber:       { type: String },
    vendorPartCost:         { type: Number},
    vendorPartDescription:  { type: String }
  }],
  updated_at: { type: Date, required: true }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
partSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
partSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
partSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
partSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/part')(partSchema);


//Export model
module.exports = mongoose.model('Parts', partSchema);
