'use strict';

const mongoose = require('mongoose');

//Construct Schema
const vendorSchema = new mongoose.Schema({
  netsuiteId: {type: String, required: true, index: {unique: true}},
  name: {type: String, required: true },
  email: {type: String},
  phone: {type: String},
  category: {type: String},
  primaryContact: {type: String},

  isCounterOrderType: {type: Boolean},

  isSynced: {type: Boolean, default: false},
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
vendorSchema.index({name: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
vendorSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});
vendorSchema.set('toJSON', { getters: true, virtuals: true });
vendorSchema.set('toObject', { getters: true, virtuals: true });

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/vendor')(vendorSchema);


//Export model
module.exports = mongoose.model('Vendors', vendorSchema);
