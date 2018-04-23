/* Model
--- Unit ---

Compressor Unit


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const mongoose  = require('mongoose'),
  autopopulate  = require('mongoose-autopopulate'),
  ObjectId      = mongoose.Schema.ObjectId;

//Construct Schema
const unitSchema = new mongoose.Schema({

  netsuiteId: { type: String, required: true, index: {unique: true}},

  number:         { type: String, required: true, index: { unique: true } },

  productSeries:  { type: String },

  setDate:        { type: Date },
  releaseDate:    { type: Date },

  geo: {
    type: {type: String, enum: ['Point'], default: 'Point'},
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
  locationName:         { type: String, index: true},
  legalDescription:     { type: String },
  county:         { type: ObjectId, ref: 'Counties', autopopulate: true },
  state:          { type: ObjectId, ref: 'States', index: true, autopopulate: true},

  //Customer:       { type: ObjectId, ref: 'Customers', index: true, autopopulate: true },
  customerName:   { type: String },
  countyName:{ type: String },
  stateName: { type: String },
  assignedTo: { type: String },

  // PM information
  status: { type: String },
  pmCycle: { type: String },
  nextPmDate: { type: Date },

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
unitSchema.index({geo: '2dsphere'});


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
