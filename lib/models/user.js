/* Model
--- User ---

Orion User


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const mongoose  = require('mongoose'),
  autopopulate  = require('mongoose-autopopulate');

//Construct Schema
const userSchema = new mongoose.Schema({

  firstName:  { type: String, required: true},
  lastName:   { type: String, required: true},
  username:   { type: String, required: true, index: { unique: true }},
  email:      { type: String, default: "", required: true },
  supervisor: { type: String, required: true, index: true },
  netsuiteId: { type: String, required: true },
  location:   { type: String, default: ""},

  role:      {
    type: String,
    enum: ["admin", "manager", "tech"],
    default: "tech"
  },

  hours: {
    weekStart:  { type: Date },
    emailed:    { type: String, enum: ['none', 'manager', 'admin', 'orion'] , default: 'none'},
    PTO:        { type: Number },
    Indirect:   { type: Number },
    PM:         { type: Number },
    Corrective: { type: Number },
    TroubleCall:{ type: Number },
    Swap:       { type: Number },
    Transfer:   { type: Number },
    NewSet:     { type: Number },
    Release:    { type: Number },
    Travel:     { type: Number },
    total:      { type: Number },
  },

  area: { type: String },
  areaId: {type: String },
  /*units: [{ type: ObjectId, ref: 'Units', index: true }],
  areas: [{ type: ObjectId, ref: 'Areas', index: true }],*/
  isSynced: {type: Boolean, default: false},
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

//Full Text Indices
userSchema.index({firstName: 'text', lastName: 'text', username: 'text'});

//Index for username and supervisor with date
userSchema.index({username: 1, supervisor: 1, updated_at: 1});
/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
userSchema.virtual('created_at')
  .get(function () {
    return this.getCreateDate();
  });


userSchema.set('toJSON', { getters: true, virtuals: true });
userSchema.set('toObject', { getters: true, virtuals: true });

/* Manager
 ----------------------------------------------------------------------------- */


require('../managers/user')(userSchema);


//Export model
module.exports = mongoose.model('Users', userSchema);
