/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/* Declaration
----------------------------------------------------------------------------- */
var LocationSchema = new mongoose.Schema({
  netsuiteId: { type: Number },
  name: { type: String },

  updated_at: { type: Date, required: true }
});

LocationSchema.pre('save', function(done){
  this.updated_at = new Date();
  done();
});
LocationSchema.pre('update', function(done){
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
LocationSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});


/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Locations', LocationSchema);
