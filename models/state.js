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
/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('States', StateSchema);
