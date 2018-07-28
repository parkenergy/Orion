'use strict';

const mongoose     = require('mongoose'),
      autopopulate = require('mongoose-autopopulate');

//Construct Schema
const mcUnitDiligenceFormSchema = new mongoose.Schema({
    unitNumber:             {type: String, required: true, index: {unique: true}},
    region:                 {type: String},
    customerName:           {type: String},
    leaseName:              {type: String},
    engine:                 {type: String},
    engineDOM:              {type: String},
    engineSerialNumber:     {type: String},
    compressor:             {type: String},
    compressorDOM:          {type: String},
    compressorSerialNumber: {type: String},

    reviewer:           {type: String},
    comments:           {type: String},
    suction:            {type: String},
    runHours:           {type: String},
    discharge1:         {type: String},
    discharge2:         {type: String},
    discharge3:         {type: String},
    applicationType:    {type: String},
    environmentalIssue: {type: Boolean},
    imageNames:         {type: [String], default: []},
});

/* Validators
----------------------------------------------------------------------------- */

/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
mcUnitDiligenceFormSchema.plugin(autopopulate);

//stamp updated_at on save

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
mcUnitDiligenceFormSchema.index({unitNumber: 1});

/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
mcUnitDiligenceFormSchema.virtual('created_at')
    .get(function () {
        return this.getCreateDate();
    });

mcUnitDiligenceFormSchema.set('toJSON', {getters: true, virtuals: true});
mcUnitDiligenceFormSchema.set('toObject', {getters: true, virtuals: true});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/mcUnitDiligenceForm')(mcUnitDiligenceFormSchema);

//Export model
module.exports = mongoose.model('MCUnitDiligenceForms', mcUnitDiligenceFormSchema);
