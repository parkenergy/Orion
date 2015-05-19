/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var DateHelper = require('../helpers/dateHelper');
var dateHelper = new DateHelper();

/* Declaration
----------------------------------------------------------------------------- */
var CompressorSchema = new mongoose.Schema({

  serial:   { type: String},
  model:    { type: String },
  compressorHoursStartDate: { type: Date },

  unit: {type: 'ObjectId', ref: "Unit", index: true }

});

/* Virtual Fields
----------------------------------------------------------------------------- */
CompressorSchema.virtual('compressorHours')
.get(function () {
  var date1 = this.compressorHoursStartDate;
  var date2 = new Date();
  return dateHelper.timeDifferenceHours(date1, date2);
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Compressors', CompressorSchema);
