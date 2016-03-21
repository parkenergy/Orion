/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');


/* Declaration
----------------------------------------------------------------------------- */
var QuarterlyInventorySchema = new mongoose.Schema({
  quarterlyinventoryDate: {type: Date},

  techId: {type: String},

  parts: [{
    partId: {type: ObjectId, ref: 'parts'},
    isWarranty: {type: Boolean, default: false},
    isBillable: {type: Boolean, default: false},
    isManual: {type: Boolean, default: false},
    quantity: {type: Number, required: true},
    cost: {type: Number, default: 0},
    description: {type: String, required: true},
    number: String,
    isSynced: {type: Boolean, default: false}
  }],

  updated_at: { type: Date, required: true}
});

QuarterlyInventorySchema.plugin(autopopulate);

QuarterlyInventorySchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

QuarterlyInventorySchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
-----------------------------------------------------------------------------
QuarterlyInventorySchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});
*/
/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("QuarterlyInventories", QuarterlyInventorySchema);
