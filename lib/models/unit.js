'use strict';

const mongoose  = require('mongoose'),
    autopopulate  = require('mongoose-autopopulate'),
    ObjectId      = mongoose.Schema.ObjectId;

const unitModelSchema = new mongoose.Schema({
    name:       {type: String},
    internalid: {type: String},
})

//Construct Schema
const unitSchema = new mongoose.Schema({

    netsuiteId: { type: String, required: true, index: {unique: true}},

    number:         { type: String, required: true},

    productSeries:  { type: String },

    setDate:        { type: Date },
    releaseDate:    { type: Date },

    geo: {
        type: {type: String, enum: 'Point', default: 'Point'},
        coordinates: {
            type: [Number],
            default: [0.0, 0.0],
            validate: [
                (v) => v.length === 2,
                '{PATH} must be length of 2(long, lat)'
            ]
        }
    },
    engineSerial:         { type: String },
    compressorSerial:     { type: String },
    locationName:         { type: String },
    legalDescription:     { type: String },
    county:         { type: ObjectId, ref: 'Counties', autopopulate: true },
    state:          { type: ObjectId, ref: 'States', autopopulate: true},

    //Customer:       { type: ObjectId, ref: 'Customers', index: true, autopopulate: true },
    customerName:   { type: String },
    countyName:{ type: String },
    stateName: { type: String },
    assignedTo: { type: String },

    // PM information
    status: { type: String },
    pmCycle: { type: String },
    nextPmDate: { type: Date },

    // UNIt PM Extras
    frameModel:  {type: unitModelSchema},
    engineModel: {type: unitModelSchema},
    nextPM1Date: {type: Date},
    nextPM2Date: {type: Date},
    nextPM3Date: {type: Date},
    nextPM4Date: {type: Date},
    nextPM5Date: {type: Date},

    isSynced: {type: Boolean, default: false},
    updated_at: { type: Date }

});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
unitSchema.plugin(autopopulate);

//stamp updated_at on save
unitSchema.pre('save', function (done) {
    this.updated_at = new Date();
    done();
});

//stamp updated_at on update
unitSchema.pre('update', function (done) {
    this.updated_at = new Date();
    done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
//unitSchema.set('autoIndex', false);
unitSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
unitSchema.virtual('created_at')
    .get(function () {
        return this.getCreateDate();
    });

unitSchema.set('toJSON', { getters: true, virtuals: true });
unitSchema.set('toObject', { getters: true, virtuals: true });

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/unit')(unitSchema);


//Export model
module.exports = mongoose.model('Units', unitSchema);
