'use strict';

const mongoose     = require('mongoose'),
      autopopulate = require('mongoose-autopopulate');

//Construct Schema
const mcUnitSchema = new mongoose.Schema({
    // Required by app
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

    // other fields I thought were needed from excel
    county:            {type: String},
    state:             {type: String},
    HP:                {type: String},
    hpRange:           {type: String},
    cylinders:         {type: String},
    stages:            {type: Number},
    trailerID:         {type: String},
    startBillingDate:  {type: String},
    stopBillingDate:   {type: String},
    baseRental:        {type: String},
    billingStatus:     {type: String},
    acsFee:            {type: Boolean},
    reservationStatus: {type: String},
    application:       {type: String},
    pkgDOM:            {type: String},
    initialSetDate:    {type: String},
    mcllcTech:         {type: String},
    supervisor:        {type: String},
    packager:          {type: String},
    packagerUnit:      {type: String},
    taxCode:           {type: String},
    deliveryTicket:    {type: String},
    poNumber:          {type: String},
});

/* Validators
----------------------------------------------------------------------------- */

/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
mcUnitSchema.plugin(autopopulate);

//stamp updated_at on save

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
//mcUnitSchema.set('autoIndex', false);
mcUnitSchema.index({unitNumber: 1});

/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
mcUnitSchema.virtual('created_at')
    .get(function () {
        return this.getCreateDate();
    });

mcUnitSchema.set('toJSON', {getters: true, virtuals: true});
mcUnitSchema.set('toObject', {getters: true, virtuals: true});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/mcUnit')(mcUnitSchema);

//Export model
module.exports = mongoose.model('MCUnits', mcUnitSchema);
