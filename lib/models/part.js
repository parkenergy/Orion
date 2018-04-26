/* Model
--- Part ---

A compressor parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const mongoose  = require('mongoose'),
  ObjectId      = mongoose.Schema.ObjectId;

//Construct Schema
const partSchema = new mongoose.Schema({
  netsuiteId:     { type: Number , index: {unique: true}},
  description:    { type: String },
  componentName:  { type: String },
  // system:         { type: Number },
  // subsystem:      { type: Number },
  // engine:         { type: Number },
  // compressor:     { type: Number },
  // component:      { type: Number },
  // revision:       { type: Number },
  MPN:            { type: String },

  isSynced: {type: Boolean, default: false},
  updated_at: { type: Date, required: true }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
partSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

//stamp updated_at on update
partSchema.pre('update', function (next) {
  this.updated_at = new Date();
  next();
});

partSchema.pre('validate', function (next) {
  this.updated_at = new Date();
  next();
});

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
partSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
partSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/part')(partSchema);


//Export model
module.exports = mongoose.model('Parts', partSchema);
