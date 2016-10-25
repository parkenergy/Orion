/* Model
--- PartOrder ---

Order for parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('lodash'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var partOrderSchema = new mongoose.Schema({
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
      vendor: { type: ObjectId, ref: 'Vendor', index: true },
      vendorPartNumber:       { type: String },
      vendorPartCost:         { type: Number},
      vendorPartDescription:  { type: String }
    }]
  },
  quantity: {type: Number, required: true},

  status: {type: String, enum: ['pending', 'backorder', 'shipped', 'canceled', 'complete'], default: 'pending'},

  timeCreated: {type: Date, required: true}, //when it was created by technician
  timeSubmitted: {type: Date, default: Date.now()}, //when it was submitted to Orion
  timeShipped: {type: Date}, //time order was shipped
  timeComplete: {type: Date}, //time the order was completed

  techId: {type: String, require: true, index: true}, //Username
  locationId: {type: String, required: true}, //NSID

  comment: String,

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


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
partOrderSchema.index({updated_at: 1});


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
