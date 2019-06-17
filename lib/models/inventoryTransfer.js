'use strict';

const mongoose  = require('mongoose'),
    autopopulate = require('mongoose-autopopulate'),
    ObjectId = mongoose.Schema.ObjectId;

//Construct Schema
const inventoryTransferSchema = new mongoose.Schema({

    inventorytransferDate: {type: Number, index: true},

    techId: {type: String},
    truckId: {type: String},

    originLocation: {type: ObjectId, ref: 'Locations', index: true},
    originLocationNSID: {type: String},
    destinationLocation: {type: ObjectId, ref: 'Locations', index: true},
    destinationLocationNSID: {type: String},

    parts: [],

    transferedBy: {type: ObjectId, ref: 'User', index: true},
    version: String,
    updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
inventoryTransferSchema.plugin(autopopulate);

//stamp updated_at on save
inventoryTransferSchema.pre('save', function (done) {
    this.updated_at = new Date();
    done();
});

//stamp updated_at on update
inventoryTransferSchema.pre('update', function (done) {
    this.updated_at = new Date();
    done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
inventoryTransferSchema.index({
    updated_at: 1,
    inventorytransferDate: 1,
});


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
