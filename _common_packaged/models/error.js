/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;

/* Declaration
----------------------------------------------------------------------------- */
var ErrorSchema = new mongoose.Schema({

  data: { type: Mixed },
  updated_at: { type: Date }

});
ErrorSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Errors', ErrorSchema);
