'use strict';

const mongoose  = require('mongoose');

// Construct Schema
const callReportSchema = new mongoose.Schema({

    // Customer name From customer
    customer: {type: String, required: true},
    // Title of caller
    title: {type: String, required: true},
    // What activity was this
    activityType: {type: String, required: true},
    // Application type
    applicationType: {type: String, required: true},
    unitType: {type: String}, // 100s, 300s
    oppType: {type: String},
    status: {type: String, required: true},

    isManualTitle: {type: Boolean, required: true},
    isManualActivity: {type: Boolean, required: true},
    isManualAppType: {type: Boolean, required: true},
    isManualUnitType: {type: Boolean},
    isManualOppType: {type: Boolean},
    isManualStatus: {type: Boolean, required: true},

    // Possible amount customer could want
    size: {type: String, required: true},
    // User input needed. No list available
    phoneNumber: {type: String},
    contactName: {type: String},
    officeLocation: {type: String},
    email: {type: String},
    callTime: {type: Date, default: Date.now},
    newCustomer: {type: Boolean, default: false},
    // do they make the choices
    decisionMaker: {type: String, required: true},
    currentSpend: {type: String, default: '$ -'},

    // No input needed
    username: {type: String, required: true, index: true},
    extension: {type: String},
    comment: {type: String},

    updated_at: {type: Date}
});



/* Validators
 ----------------------------------------------------------------------------- */


/* Hooks
 ----------------------------------------------------------------------------- */
//stamp updated_at on save
callReportSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

//stamp updated_at on update
callReportSchema.pre('update', function (next) {
    this.updated_at = new Date();
    next();
});


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
