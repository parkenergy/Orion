/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var CustomerSchema = new mongoose.Schema({

  dbaCustomerName:  { type: String, required: true, index: { unique: true } },
  customerFamily:   { type: String },
  address:          { type: String },
  phone:            { type: String },
  email:            { type: String },

  locations: 	      [{type: ObjectId, ref: 'Locations', index: true, autopopulate: { select: 'name' }}],
  units:            [{type: ObjectId, ref: 'Units', index: true, autopopulate: { select: 'number' }}]

});
CustomerSchema.plugin(autopopulate);

CustomerSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Customers', CustomerSchema);
