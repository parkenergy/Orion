/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');


/* Declaration
----------------------------------------------------------------------------- */
var SyncDataSchema = new mongoose.Schema({
  date: { type: Date, required: true},
  type: { type: String, required: true}
});
SyncDataSchema.plugin(autopopulate);
SyncDataSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
SyncDataSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});
/* Virtual Fields
----------------------------------------------------------------------------- */
SyncDataSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Syncs', SyncDataSchema);
