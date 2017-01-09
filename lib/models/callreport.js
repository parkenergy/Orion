/**
 *            callreport
 *
 * Created by marcusjwhelan on 1/6/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var mongoose  = require('mongoose'),
    _         = require('lodash'),
    ObjecctId = mongoose.Schema.ObjectId;

// Construct Schema
var callReportSchema = new mongoose.Schema({

  // Customer name From customer
  customer:     { type: String, required: true },
  // Title of caller
  title:        { type: String, required: true },
  // What activity was this
  activityType: { type: String, required: true },
  // Application type
  application:  { type: String, required: true },
  unitType:     { type: String, required: true }, // 100s, 300s
  // Possible amount customer could want
  size:         { type: String, required: true },
  oppType:      { type: String, required: true },
  status:       { type: String, required: true },

  // User input needed. No list available
  phoneNumber:  { type: String, required: true },
  contactName:  { type: String },
  officeLocation: { type: String },
  email:        { type: String },
  callTime:     { type: Date, required: true, default: new Date() },
  newCustomer:  { type: Boolean, default: false },
  // do they make the choices
  decisionMaker:  { type: String, required: true },
  currentSpend: { type: String, default: '$ -' },

  // No input needed
  username:     { type: String, required: true, index: true }

});



/* Validators
 ----------------------------------------------------------------------------- */


/* Hooks
 ----------------------------------------------------------------------------- */


/* Virtual Fields
 ----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
callReportSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});


/* Manager
 ----------------------------------------------------------------------------- */
require('../managers/callReport')(callReportSchema);

// Export model
module.exports = mongoose.model('CallReports', callReportSchema);
