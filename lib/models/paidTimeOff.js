// 'use strict';

const mongoose = require('mongoose'),
  autopopulate = require('mongoose-autopopulate'),
  ObjectId     = mongoose.Schema.ObjectId;

const paidTimeOffSchema = new mongoose.Schema({
  DateFrom: {type: Date, index: true},
  DateTo:   {type: Date, index: true},

  hours: {type: Number},
  type:  {type: String, enum: ['Vacation', 'Sick Leave']},
  comment: {type: String},
  approvedBy: {type: String},

  userId: {type: ObjectId, ref: 'Users'},

  username: {type: String, index: true},
  created: {type: Date},

  approved: {type: Boolean},
  rejected: {type: Boolean, default: false},
  timeApproved: {type: Date},
  managerComment: {type: String, default: ''},

  adminReviewed: {type: Boolean, default: false},

  updated_at: {type: Date},
});

paidTimeOffSchema.plugin(autopopulate);

//stamp updated_at on update
paidTimeOffSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});



/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
paidTimeOffSchema.index({
  DateTo: 1,
  DateFrom: 1,
});

/* Virtual Fields
----------------------------------------------------------------------------- */

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/paidTimeOff')(paidTimeOffSchema);


//Export model
module.exports = mongoose.model('PaidTimeOffs', paidTimeOffSchema);
