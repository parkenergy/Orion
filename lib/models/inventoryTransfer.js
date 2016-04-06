/* Model
--- InventoryTransfer ---

Inventory transfers between locations


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  autopopulate = require('mongoose-autopopulate'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var inventoryTransferSchema = new mongoose.Schema({
  inventorytransferDate: { type: Date },

  originLocation: { type: ObjectId, ref: 'Locations', index: true },
  destinationLocation: { type: ObjectId, ref: 'Locations', index: true },

  parts: [],

  transferedBy: { type: ObjectId, ref: 'User', index: true },
  updated_at: { type: Date, required: true}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
inventoryTransferSchema.plugin(autopopulate);

//stamp update_at on save
inventoryTransferSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp update_at on update
inventoryTransferSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by update_at
inventoryTransferSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
inventoryTransferSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/inventoryTransfer')(inventoryTransferSchema);


//Export model
module.exports = mongoose.model('InventoryTransfers', inventoryTransferSchema);