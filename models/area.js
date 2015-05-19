/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var AreaSchema = new mongoose.Schema({

  name: { type: String, required: true, index: { unique: true } },
  locations: [{ type: ObjectId, index: true }]

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Areas', AreaSchema);
