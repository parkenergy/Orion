/* Model
--- PartOrder ---

Order for parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const mongoose  = require('mongoose'),
  xx            = require('xxhashjs'),
  ObjectId      = mongoose.Schema.ObjectId;

//Construct Schema
const partOrderSchema = new mongoose.Schema({
  orderId: {type: String, required: true, index: true}, //ID used to track order between client and backend
  poFormID: {type: String},
  partNSID: {type: Number, required: true},
  part: {
    vendor:         { type: String },
    number:         { type: String },
    description:    { type: String },
    componentName:  { type: String },
    //system:         { type: Number },
    //subsystem:      { type: Number },
    //engine:         { type: Number },
    //compressor:     { type: Number },
    //component:      { type: Number },
    //revision:       { type: Number },
    MPN:            { type: String },
    isManual:       { type: Boolean, default: false }//,

    /*  We don't use any of the commented out variables
    *
    * */

    /*vendors: [{
      vendor: { type: ObjectId, ref: 'Vendor'},
      vendorPartNumber:       { type: String },
      vendorPartCost:         { type: Number},
      vendorPartDescription:  { type: String }
    }]*/
  },
  quantity: {type: Number, required: true},

  status: {type: String, enum: ['pending', 'backorder', 'ordered', 'canceled', 'completed'], default: 'pending'},

  timeCreated:      { type: Date, required: true}, //when it was created by technician
  timeSubmitted:    { type: Date, default: Date.now()}, //when it was submitted to Orion
  timeOrdered:      { type: Date}, //time order was ordered
  timeComplete:     { type: Date}, //time the order was completed

  techId:           { type: String, require: true}, //Username
  approvedBy:       { type: String }, // Manager/Admin.
  completedBy:      { type: String }, // Who confirmed arrival of PO

  originNSID:       { type: Number}, // origin NSID set by manager
  destinationNSID:  { type: Number, require: true}, // destination NSID set by technician

  poNumber:   { type: String}, // Tracking number added by managers
  // carrier:          { type: String }, // Name of carrier for tracking number

  comment: String,

  technician:       { type: ObjectId, ref: 'Users', index: true },

  source: { type: String, default: 'Orion' }, // needed to differentiate POs made on either the client or Orion.
  done:   { type: Boolean, default: false, index: true}, // Stop sending back and forth
  exists: { type: Boolean, default: true},

  updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */


/***************
  Stamp updated_at
 ***************/
//set updated_at timestamp
function updated_at(next) {
  this.updated_at = new Date();
  next();
}

//stamp updated_at on save
partOrderSchema.pre('save', updated_at);

partOrderSchema.pre('findOneAndUpdate', function (next) {
  this._update.updated_at = new Date();
  next();
});

//stamp updated_at on update
partOrderSchema.pre('update', updated_at);

/***************
 Timestamp on status update
 ***************/

//update timestamps on status change
function updateTimeStamps(next) {
  this.timeSubmitted = (!this.timeSubmitted) ? new Date() : this.timeSubmitted;
  this.timeOrdered = ( this.status === 'ordered' ) ? (!this.timeOrdered ? new Date() : this.timeOrdered) : null;
  this.timeComplete = ( this.status === 'completed') ? (!this.timeComplete ? new Date() : this.timeComplete) : null;

  next();
}

//update timestamps on save
partOrderSchema.pre('save', updateTimeStamps);

partOrderSchema.pre('findOneAndUpdate', function (next) {
  if(!this._update.timeOrdered){
    this._update.timeOrdered = (this._update.status === 'ordered') ? (!this._update.timeOrdered ? new Date() : this._update.timeOrdered) : null;
  }

  if(!this._update.timeComplete){
    this._update.timeComplete = (this._update.status === 'completed') ? (!this._update.timeComplete ? new Date() : this._update.timeComplete) : null;
  }

  // Canceling sets complete if made on Orion
  if(this._update.source === 'Orion'){
    if(!this._update.timeComplete && this._update.status === 'canceled'){
      this._update.timeComplete = new Date();
    }
  }

  next();
});

//update timestamps on update
partOrderSchema.pre('update', function (next) {
  // Not sure if this works. No managers use update.
  this._update.$set.timeOrdered = ( this._update.$set.status === 'ordered' ) ? (!this._update.$set.timeOrdered ? new Date() : this._update.$set.timeOrdered) : null;
  this._update.$set.timeComplete = ( this._update.$set.status === 'completed') ? (!this._update.$set.timeComplete ? new Date() : this._update.$set.timeComplete) : null;

  next();
});

/***************
 Set done on complete
 ***************/
//set done when status complete
function setDone(next) {
  if(this.status === 'completed') this.done = true;

  next();
}

//set done on save
partOrderSchema.pre('save', setDone);

partOrderSchema.pre('findOneAndUpdate', function (next) {
  if(this._update.status === 'canceled' && this._update.completedBy) this._update.done = true;

  if(this._update.status === 'completed') this._update.done = true;

  // Canceled POs made on Orion are set to done
  if(this._update.source === 'Orion'){
    if(this._update.status === 'canceled'){
      this._update.done = true;
    }
  }

  next();
});

//set done on update
partOrderSchema.pre('update', function (next) {
  // Not sure if this works we never use update in the managers
  if(this._update.$set.status === 'completed') this._update.$set.done = true;

  next();
});

/***************
 Generate orderId
 ***************/
// Generate unique orderId
partOrderSchema.pre('validate', function (done) {
  if(!this.orderId){
    const hash = xx.h64(Date.now());
    hash.update(this.techId);
    hash.update(this.partNSID.toString());
    this.orderId = hash.digest().toString(36);
  }
  done();
});

/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
partOrderSchema.index({timeCreated: 1, status: 1, techId: 1});

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
