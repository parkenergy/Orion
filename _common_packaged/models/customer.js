/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var CustomerSchema = new mongoose.Schema({


  name:             { type: String, required: true, index: { unique: true } },
  shortname:        { type: String, required: true, index: { unique: true } },
  netsuiteId:       { type: String, required: true, index: { unique: true } },
  phone:            { type: String },
  email:            { type: String },
  updated_at:       { type: Date },

});
CustomerSchema.plugin(autopopulate);
CustomerSchema.pre('save', function(done) {
  this.updatedAt = new Date();
  done();
});

CustomerSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Customers', CustomerSchema);
