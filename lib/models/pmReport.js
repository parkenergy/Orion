'use strict';

const mongoose = require('mongoose');

const pmReportSchema = new mongoose.Schema({
  unitNumber:   { type: String },
  unitType:     { type: String },
  unitTypeNSID: { type: String },
  customer:     { type: String },
  leaseName:    { type: String },
  nextPmDate:   { type: Date },
  userId:       { type: String, required: true, index: true},
  created:      { type: String },
  cycleTime:    { type: String },
  netsuiteId:   { type: String, requied: true },
  
  updated_at:   { type: Date }
});


/* Hooks
 ----------------------------------------------------------------------------- */
//stamp updated_at on save
pmReportSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

//stamp updated_at on update
pmReportSchema.pre('update', function (next) {
  this.updated_at = new Date();
  next();
});

/* Virtual Fields
 ----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
pmReportSchema.virtual('created_at')
  .get(function () {
    return this.getCreateDate();
  });

require('../managers/pmReport')(pmReportSchema);

module.exports = mongoose.model('pmReport', pmReportSchema);