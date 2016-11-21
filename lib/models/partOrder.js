/* Model
--- PartOrder ---

Order for parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('lodash'),
  xx        = require('xxhashjs'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var partOrderSchema = new mongoose.Schema({
  orderId: {type: String, required: true, index: true}, //ID used to track order between client and backend
  partNSID: {type: Number, required: true},
  part: {
    description:    { type: String },
    componentName:  { type: String },
    system:         { type: Number },
    subsystem:      { type: Number },
    engine:         { type: Number },
    compressor:     { type: Number },
    component:      { type: Number },
    revision:       { type: Number },
    MPN:            { type: String },

    vendors: [{
      vendor: { type: ObjectId, ref: 'Vendor'},
      vendorPartNumber:       { type: String },
      vendorPartCost:         { type: Number},
      vendorPartDescription:  { type: String }
    }]
  },
  quantity: {type: Number, required: true},

  status: {type: String, enum: ['pending', 'backorder', 'shipped', 'canceled', 'completed'], default: 'pending'},

  timeCreated: {type: Date, required: true}, //when it was created by technician
  timeSubmitted: {type: Date, default: Date.now()}, //when it was submitted to Orion
  timeShipped: {type: Date}, //time order was shipped
  timeComplete: {type: Date}, //time the order was completed

  techId: {type: String, require: true}, //Username
  approvedBy: { type: String }, // Manager/Admin.
  completedBy: { type: String }, // Who confirmed arrival of PO

  originNSID: {type: Number}, // origin NSID set by manager
  destinationNSID: {type: Number, require: true}, // destination NSID set by technician

  trackingNumber: {type: String}, // Tracking number added by managers

  comment: String,

  done: {type: Boolean, default: false}, // Stop sending back and forth
  exists: {type: Boolean, default: true},

  updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
partOrderSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
partOrderSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

// Generate unique orderId
partOrderSchema.pre('save', function (done) {
  if(!this.orderId){
    var hash = xx.h64(Date.now());
    hash.update(this.techId);
    hash.update(this.partNSID.toString());
    this.orderId = hash.digest().toString(36);
  }
  done();
});

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
partOrderSchema.index({updated_at: 1});

partOrderSchema.index({updated_at: 1, techId: 1});

partOrderSchema.index({updated_at: 1, approvedBy: 1});

/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
partOrderSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/partOrder')(partOrderSchema);


//Export model
module.exports = mongoose.model('PartOrders', partOrderSchema);
