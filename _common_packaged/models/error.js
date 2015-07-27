/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;

/* Declaration
----------------------------------------------------------------------------- */
var ErrorSchema = new mongoose.Schema({

  data: { type: Mixed }

});

/* Virtual Fields
----------------------------------------------------------------------------- */
ErrorSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Errors', ErrorSchema);
