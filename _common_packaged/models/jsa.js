/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var JsaSchema = new mongoose.Schema({

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

JsaSchema.pre('save', function(done){
  this.updated_at = new Date();
  done();
});
JsaSchema.pre('update', function(done){
  this.updated_at = new Date();
  done();
})
/* Virtual Fields
----------------------------------------------------------------------------- */
JsaSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Jsas', JsaSchema);
