/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var CountySchema = new mongoose.Schema({

  name: { type: String, required: true, index: true },
  state: { type: ObjectId, ref: 'States', required: true, index: true, autopopulate: true },
  updated_at: { type: Date, required: true }

});
CountySchema.plugin(autopopulate);
CountySchema.pre('save', function(next) {
    now = new Date();
    this.updated_at = now;
    next();
});
CountySchema.pre('update', function(next) {
    now = new Date();
    this.updated_at = now;
    next();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
CountySchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model('Counties', CountySchema);
