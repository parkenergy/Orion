/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var StateSchema = new mongoose.Schema({

  name: { type: String, required: true, index: true },
  counties: [{type: ObjectId, ref: 'Counties', index: true }]

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('States', StateSchema);
