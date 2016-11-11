/* Model
--- QuarterlyInventory ---

Quarterly Inventories


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const mongoose  = require('mongoose'),
  _         = require('lodash'),
  autopopulate = require('mongoose-autopopulate'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
const quarterlyInventorySchema = new mongoose.Schema({
  quarterlyinventoryDate: {type: Date},

  techId: {type: String},
  truckId: { type: String },

  parts: [{
    vendor: {type: String},
    partId: {type: ObjectId, ref: 'parts'},
    isWarranty: {type: Boolean, default: false},
    isBillable: {type: Boolean, default: false},
    isManual: {type: Boolean, default: false},
    quantity: {type: Number, required: true},
    cost: {type: Number, default: 0},
    description: {type: String, required: true},
    smartPart:   {type: String},
    number: String,
    netsuiteId: String
  }],

  version: String,

  updated_at: { type: Date }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
quarterlyInventorySchema.plugin(autopopulate);

//stamp updated_at on save
quarterlyInventorySchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
quarterlyInventorySchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
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
