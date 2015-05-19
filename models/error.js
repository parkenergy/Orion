/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;

/* Declaration
----------------------------------------------------------------------------- */
var ErrorSchema = new mongoose.Schema({

  data: { type: Mixed }

});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Errors', ErrorSchema);
