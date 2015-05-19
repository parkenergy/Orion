/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var CountySchema = new mongoose.Schema({

  name: { type: String, required: true, index: true },
  state: {type: ObjectId, ref: 'States', required: true, index: true }

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Counties', CountySchema);
