/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var LocationSchema = new mongoose.Schema({

  name:         { type: String, required: true, index: { unique: true } },

  apiNumber:    { type: String },

  locationType: { type: String, enum: ["Lease", "Truck", "Yard"] }, //TODO: make warehouses

  customer:     { type: ObjectId, ref: 'Customer', index: true, autopopulate: true },
  area:         { type: ObjectId, ref: 'Area', index: true, autopopulate: true },
  state:        { type: ObjectId, ref: 'State', index: true, autopopulate: true },
  county:       { type: ObjectId, ref: 'County', index: true, autopopulate: true },

});
LocationSchema.plugin(autopopulate);

/* Virtual Fields
----------------------------------------------------------------------------- */
LocationSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Locations', LocationSchema);
