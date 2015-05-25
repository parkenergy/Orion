/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var AreaSchema = new mongoose.Schema({

  name: { type: String, required: true, index: { unique: true } },
  locations: [{ type: ObjectId, index: true, autopopulate: true }]

});
AreaSchema.plugin(autopopulate);

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Areas', AreaSchema);
