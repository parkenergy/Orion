'use strict';

const mongoose = require('mongoose'),
  ObjectId      = mongoose.Schema.ObjectId;

//Construct Schema
const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  prefix: {type: String, required: true, index: true}, // abbreviation
  counties: {type: [ObjectId]}, // string of ids
  shape: {
    type: {type: String, enum: ['GeometryCollection'], default: 'GeometryCollection'},
    geometries: {
      type: [[[[Number]]]],
      default: [[[[0.0, 0.0]]]]
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
