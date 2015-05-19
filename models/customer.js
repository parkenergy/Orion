/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var CustomerSchema = new mongoose.Schema({

  dbaCustomerName:  { type: String },
  customerFamily:   { type: String },
  address:          { type: String },
  phone:            { type: String },
  email:            { type: String },

  locations: 	      [{type: ObjectId, ref: 'Locations', index: true}],
  units:            [{type: ObjectId, ref: 'Units', index: true}],

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Customers', CustomerSchema);
