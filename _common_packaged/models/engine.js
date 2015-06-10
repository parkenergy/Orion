/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var EngineSchema = new mongoose.Schema({

  serial:   { type: String, required: true, index: { unique: true } },
  model:    { type: String },

  engineHoursStartDate: { type: Date },

  unit: {type: 'ObjectId', ref: "Unit", index: true, autopopulate: true }

});
EngineSchema.plugin(autopopulate);

/* Virtual Fields
----------------------------------------------------------------------------- */
EngineSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

EngineSchema.virtual('engineHours')
.get(function () {
  var date1 = this.engineHoursStartDate;
  var date2 = new Date();
  return dateHelper.timeDifferenceHours(date1, date2);
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Engines', EngineSchema);
