/* Model
--- ReviewNote ---

Notes for workorder review&#x2F;edit


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var reviewNoteSchema = new mongoose.Schema({
  user: {type: String, required: true},
  note: {type: String, required: true},
  workOrder: {type: ObjectId, ref: 'WorkOrders', required: true, index: true},
  updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
reviewNoteSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
reviewNoteSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
reviewNoteSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
reviewNoteSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/reviewNote')(reviewNoteSchema);


//Export model
module.exports = mongoose.model('ReviewNotes', reviewNoteSchema);