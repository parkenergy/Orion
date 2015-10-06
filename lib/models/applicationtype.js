/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var ApplicationTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true},
  netsuiteId: {type: String, required: true, unique: true}
});

ApplicationTypeSchema.virtual('createdOn')
.get( function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('ApplicationTypes', ApplicationTypeSchema);
