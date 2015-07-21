/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var VendorSchema = new mongoose.Schema({

  vendorName:   { type: String, required: true, unique: true},
  vendorFamily: { type: String },
  address:      { type: String },
  phone:        { type: String },
  email:        { type: String }

});

/* Virtual Fields
----------------------------------------------------------------------------- */
VendorSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Vendors', VendorSchema);
