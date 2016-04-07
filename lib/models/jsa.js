/* Model
--- Jsa ---

JSA forms


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var mongoose  = require('mongoose'),
  _         = require('underscore'),
  autopopulate = require('mongoose-autopopulate'),
  ObjectId  = mongoose.Schema.ObjectId;

//Construct Schema
var jsaSchema = new mongoose.Schema({

  workorder: { type: ObjectId, ref: 'Units', index: true, autopopulate: true },

  location: { type: String },
  customer: { type: String },
  descriptionOfWork: { type: String },
  emergencyEvac:  { type: String },
  potentialHazards: {
    bodyPosition: { type: Boolean },
    pinch: { type: Boolean },
    crushOrStriking: { type: Boolean },
    sharpEdges: { type: Boolean },
    materialHandling: { type: Boolean },
    environmental: { type: Boolean },
    lifting: { type: Boolean },
    elevatedBodyTemp: { type: Boolean },
    h2s: { type: Boolean },
    hotColdSurfaces: { type: Boolean },
    laceration: { type: Boolean },
    chemExposure: { type: Boolean },
    fallFromElevation: { type: Boolean },
    slickSurfaces: { type: Boolean },
    excavation: { type: Boolean },
    slips: { type: Boolean },
    trips: { type: Boolean },
    falls: { type: Boolean },
    equipment: { type: Boolean },
    fireExplosionPotential: { type: Boolean },
    eletricShock: { type: Boolean },
    confinedSpace: { type: Boolean },
  },
  controlsAndPractices:{
    confinedSpaceEntry: { type: Boolean },
    spillKit: { type: Boolean },
    restrictAccess: { type: Boolean },
    cutResistantGloves: { type: Boolean },
    ppe: { type: Boolean },
    reviewEmergencyActionPlan: { type: Boolean },
    drinkWater: { type: Boolean },
    electrician: { type: Boolean },
    heatResistantGloves: { type: Boolean },
    lockoutTagout: { type: Boolean },
    depressurize: { type: Boolean },
    chemGloves: { type: Boolean },
    siteJobOrientation: { type: Boolean },
    samplingMonitoring: { type: Boolean },
    equipmentCooldown: { type: Boolean },
    fireExtinguisher: { type: Boolean },
  },
  hazardPlanning: { type: String },
  agree: { type: Boolean },

  updated_at: { type: Date, required: true }
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//Autopopulate plugin
jsaSchema.plugin(autopopulate);

//stamp updated_at on save
jsaSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

//stamp updated_at on update
jsaSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
jsaSchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
jsaSchema.virtual('created_at')
.get(function () {
  return this.getCreateDate();
});

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/jsa')(jsaSchema);


//Export model
module.exports = mongoose.model('Jsas', jsaSchema);
