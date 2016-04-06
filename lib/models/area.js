/* Model
--- Area ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var areaSchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  locations: [{ type: ObjectId, index: true, autopopulate: true }],
  updated_at: { type: Date, required: true }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp update_at on save
areaSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp update_at on update
areaSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by update_at
areaSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
areaSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/area')(areaSchema);


//Export model
module.exports = mongoose.model('Areas', areaSchema);