'use strict';

const mongoose = require('mongoose');

//Construct Schema
const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  prefix: {type: String},
  counties: {type: [String]},
  shape: {
    type: {type: String, enum: ['MultiPolygon'], default: 'MultiPolygon'},
    coordinates: {
      type: [Number],
      default: [0.0, 0.0],
    }
  },
  updated_at: {type: Date, default: new Date()}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
stateSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
stateSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
stateSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
stateSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/state')(stateSchema);


//Export model
module.exports = mongoose.model('States', stateSchema);
