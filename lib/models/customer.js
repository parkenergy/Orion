/* Model
--- Customer ---

Customer data


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('lodash'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var customerSchema = new mongoose.Schema({
  name:             { type: String, required: true, index: { unique: true } },
  shortname:        { type: String, required: true, index: { unique: true } },
  netsuiteId:       { type: String, required: true, index: { unique: true } },
  phone:            { type: String },
  email:            { type: String },
  updated_at:       { type: Date, required: true }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
customerSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
customerSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
customerSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
customerSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/customer')(customerSchema);


//Export model
module.exports = mongoose.model('Customers', customerSchema);
