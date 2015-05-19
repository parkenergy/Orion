/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var VendorSchema = new mongoose.Schema({

  vendorName:   { type: String, required: true, index: { unique: true } },
  vendorFamily: { type: String },
  address:      { type: String },
  phone:        { type: String },
  email:        { type: String },

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Vendors', VendorSchema);
