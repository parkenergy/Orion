/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var LocationSchema = new mongoose.Schema({

  name:         { type: String, required: true, index: { unique: true } },
  number:       { type: String },

  apiNumber:    { type: String },

  locationType: { type: String, enum: ["Lease", "Truck", "Yard"] },
  customer:     { type: ObjectId, ref: 'Customer', index: true },

  area:         { type: ObjectId, ref: 'Area', index: true },
  state:        { type: ObjectId, ref: 'State', index: true },
  county:       { type: ObjectId, ref: 'County', index: true },

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Locations', LocationSchema);
