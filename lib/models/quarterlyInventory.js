/* Model
--- QuarterlyInventory ---

Quarterly Inventories


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  autopopulate = require('mongoose-autopopulate'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var quarterlyInventorySchema = new mongoose.Schema({
  quarterlyinventoryDate: {type: Date},

  techId: {type: String},

  parts: [{
    partId: {type: ObjectId, ref: 'parts'},
    isWarranty: {type: Boolean, default: false},
    isBillable: {type: Boolean, default: false},
    isManual: {type: Boolean, default: false},
    quantity: {type: Number, required: true},
    cost: {type: Number, default: 0},
    description: {type: String, required: true},
    number: String
  }],

  updated_at: { type: Date, required: true}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
quarterlyInventorySchema.plugin(autopopulate);

//stamp update_at on save
quarterlyInventorySchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp update_at on update
quarterlyInventorySchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by update_at
quarterlyInventorySchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
quarterlyInventorySchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/quarterlyInventory')(quarterlyInventorySchema);


//Export model
module.exports = mongoose.model('QuarterlyInventories', quarterlyInventorySchema);