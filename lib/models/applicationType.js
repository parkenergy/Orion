'use strict';

const mongoose = require('mongoose');

//Construct Schema
const applicationTypeSchema = new mongoose.Schema({
    type:         {type: String, required: true},
    netsuiteId:   {type: String, required: true, index: {unique: true}},
    isSynced:     {type: Boolean, default: false},
    activeStatus: {
        type:     Boolean,
        required: true,
        index:    true,
        default:  false
    },
    updated_at:   {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
applicationTypeSchema.pre('save', function (done) {
    this.updated_at = new Date();
    done();
});

//stamp updated_at on update
applicationTypeSchema.pre('update', function (done) {
    this.updated_at = new Date();
    done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
applicationTypeSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
applicationTypeSchema.virtual('created_at')
    .get(function () {
    return this.getCreateDate();
    });

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/applicationType')(applicationTypeSchema);


//Export model
module.exports = mongoose.model('ApplicationTypes', applicationTypeSchema);
