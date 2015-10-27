/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var TransferSchema = new mongoose.Schema({

  transferDate :  { type: Date},

  Unit:           { type: ObjectId, ref: 'Units', index: true, autopopulate: true},

  origin: {
    customer:     { type: ObjectId, ref: 'Customers', index: true, autopopulate: true},
    county:       { type: ObjectId, ref: 'Counties', index: true, autopopulate: true},
    state:        { type: ObjectId, ref: 'States', index: true, autopopulate: true},
    location:     { type: String },
    legal:        { type: String},
  },

  destination:  {
    customer:     { type: String },
    county:       { type: ObjectId, ref: 'Counties', index: true},
    state:        { type: ObjectId, ref: 'States', index: true},
    location:     { type: String},
    legal:        { type: String },
  },

  transferedBy:   { type: ObjectId, ref: 'Users', index: true},

  unitNumber: { type: String},
  techId: {type: String},
  customerName: {type: String},

  transferNote:   { type: String },
  updated_at: { type: Date, required: true }
});
TransferSchema.plugin(autopopulate);
TransferSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
TransferSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
TransferSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("Transfers", TransferSchema);
