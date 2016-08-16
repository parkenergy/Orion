/* Model
--- User ---

Orion User


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('lodash'),
  autopopulate = require('mongoose-autopopulate'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var userSchema = new mongoose.Schema({

  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  username:   { type: String, required: true, index: { unique: true }},
  email:      { type: String, required: true },
  supervisor: { type: String, required: true, index: true },
  netsuiteId: { type: String, required: true },
  truckId:    { type: String },

  role:      {
    type: String,
    enum: ["Technician", "Reviewer", "Corporate", "Admin"],
    default: "Technician"
  },

  units: [{ type: ObjectId, ref: 'Units', index: true }],
  areas: [{ type: ObjectId, ref: 'Areas', index: true }],

  updated_at: { type: Date }

});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
userSchema.plugin(autopopulate);

//stamp updated_at on save
userSchema.pre('save', function (done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
userSchema.pre('update', function (done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
userSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
userSchema.virtual('created_at')
  .get(function () {
    return this.getCreateDate();
  });


workOrderSchema.set('toJSON', { getters: true, virtuals: true });
workOrderSchema.set('toObject', { getters: true, virtuals: true });

/* Manager
 ----------------------------------------------------------------------------- */


require('../managers/user')(userSchema);


//Export model
module.exports = mongoose.model('Users', userSchema);
