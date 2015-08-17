/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var TransferSchema = new mongoose.Schema({

  transferDate :  { type: Date},

  unit:           { type: ObjectId, ref: 'Unit', index: true, autopopulate: true},

  origin: {
    customer:     { type: ObjectId, ref: 'Customer', index: true, autopopulate: true},
    county:       { type: ObjectId, ref: 'County', index: true, autopopulate: true},
    state:        { type: ObjectId, ref: 'State', index: true, autopopulate: true},
    location:     { type: String, autopopulate: true },
    legal:        { type: String, autopopulate: true, autopopulate: true },
  },

  destination:  {
    customer:     { type: ObjectId, ref: 'Customer', index: true},
    county:       { type: ObjectId, ref: 'County', index: true},
    state:        { type: ObjectId, ref: 'State', index: true},
    location:     { type: String},
    legal:        { type: String },
  },

  transferedBy:   { type: ObjectId, ref: 'User', index: true},

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
