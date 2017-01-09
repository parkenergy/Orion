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
  timeSubmitted:  { type: Date, default: Date.now()},// needed for sorting

  // Customer name From customer
  customer:     { type: String, required: true },
  // Username from user who made
  username:     { type: String, required: true, index: true },
  // Title of caller
  title:        { type: String, required: true },
  // do they make the choices
  decisionMaker:  { type: String, required: true },
  // What activity was this
  activityType: { type: String, required: true },
  // Application type
  application:  { type: String, required: true },
  unitType:     { type: String, required: true }, // 100s, 300s
  // Possible amount customer could want
  size:         { type: String, required: true },
  oppType:      { type: String, required: true },
  status:       { type: String, required: true },
  currentSpend: { type: String, default: '$ -' }
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
