/* Model
--- ApplicationType ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var applicationTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true},
  netsuiteId: {type: String, required: true, unique: true},
  updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp update_at on save
applicationTypeSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp update_at on update
applicationTypeSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by update_at
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