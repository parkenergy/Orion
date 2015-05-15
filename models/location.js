var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var LocationSchema = new mongoose.Schema({

  name:         { type: String },
  number:       { type: String },
  state:        { type: String },
  county:       { type: String },
  apiNumber:    { type: String },

  locationType: { type: String, enum: ["Lease", "Truck", "Yard"] },
  customer:     {type: ObjectId, ref: 'Customer', index: true}]

});

module.exports = mongoose.model('Locations', LocationSchema);
