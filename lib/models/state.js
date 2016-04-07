/* Model
--- State ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var stateSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp update_at on save
stateSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp update_at on update
stateSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by update_at
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