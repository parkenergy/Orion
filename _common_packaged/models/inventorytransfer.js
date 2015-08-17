/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');

/* Declaration
----------------------------------------------------------------------------- */
var InventoryTransferSchema = new mongoose.Schema({

  inventorytransferDate: { type: Date },

  originWarehouse:{
    name: { type: String}
  },

  destinationWarehouse:{
    name: {type: String}
  },

  transferedBy: { type: ObjectId, ref: 'User', index: true},
  updated_at: { type: Date, required: true}
});

InventoryTransferSchema.plugin(autopopulate);

InventoryTransferSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});

InventoryTransferSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});

/* Virtual Fields
----------------------------------------------------------------------------- */
InventoryTransferSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("InventoryTransfers", InventoryTransferSchema);
