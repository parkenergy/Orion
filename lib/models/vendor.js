/* Model
--- Vendor ---

Parts Vendor


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const mongoose  = require('mongoose'),
  _         = require('lodash'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
const vendorSchema = new mongoose.Schema({
  vendorName:   { type: String, required: true, unique: true},
  vendorFamily: { type: String },
  address:      { type: String },
  phone:        { type: String },
  email:        { type: String },

  updated_at: { type: Date }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
vendorSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
vendorSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
vendorSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
vendorSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/vendor')(vendorSchema);


//Export model
module.exports = mongoose.model('Vendors', vendorSchema);
