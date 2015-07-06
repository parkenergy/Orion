/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var StateSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }
});
StateSchema.plugin(autopopulate);

/* Virtual Fields
----------------------------------------------------------------------------- */
StateSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('States', StateSchema);
