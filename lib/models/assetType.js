'use strict';

const mongoose = require('mongoose');

//Construct Schema
const assetTypeSchema = new mongoose.Schema({
  type: { type: String, required: true},
  netsuiteId: {type: String, required: true, index: {unique: true}},
  isSynced: {type: Boolean, default: false},
  updated_at: {type: Date}
});


/* Validators
 ----------------------------------------------------------------------------- */


/* Hooks
 ----------------------------------------------------------------------------- */

//stamp updated_at on save
assetTypeSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
assetTypeSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
 ----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
assetTypeSchema.index({updated_at: 1});


/* Virtual Fields
 ----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
assetTypeSchema.virtual('created_at')
                     .get(function () {
                       return this.getCreateDate();
                     });

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/assetType')(assetTypeSchema);


//Export model
module.exports = mongoose.model('AssetType', assetTypeSchema);
