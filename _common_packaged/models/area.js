/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var AreaSchema = new mongoose.Schema({

  name: { type: String, required: true, index: { unique: true } },
  locations: [{ type: ObjectId, index: true, autopopulate: true }],
  updated_at: { type: Date, required: true }

});
AreaSchema.plugin(autopopulate);
AreaSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
AreaSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
AreaSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});


/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Areas', AreaSchema);
