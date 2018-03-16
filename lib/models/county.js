'use strict';

const mongoose  = require('mongoose');

//Construct Schema
const countySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  shape: {
    type: {type: String, enum: ['MultiPolygon'], default: 'MultiPolygon'},
    coordinates: {
      type: [Number],
      default: [0.0, 0.0],
    }
  },
  updated_at: { type: Date, default: new Date()}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
// countySchema.plugin(autopopulate);

//stamp updated_at on save
countySchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
countySchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
countySchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
countySchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/county')(countySchema);


//Export model
module.exports = mongoose.model('Counties', countySchema);
