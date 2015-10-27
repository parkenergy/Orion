/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');
// var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

/* Declaration
----------------------------------------------------------------------------- */
var UserSchema = new mongoose.Schema({

    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    username:   { type: String, required: true, index: { unique: true }},
    email:      { type: String, required: true },
    netsuiteId: { type: String, required: true },
    truckId:    { type: String },

    role:      {
      type: String,
      enum: ["Technician", "Reviewer", "Corporate", "Admin"],
      default: "Technician"
    },

    units: [{ type: ObjectId, ref: 'Units', index: true }],
    areas: [{ type: ObjectId, ref: 'Areas', index: true }],

    updated_at: { type: Date, required: true }

});
UserSchema.plugin(autopopulate);
UserSchema.pre('save', function(done) {
  this.updated_at = new Date();
  done();
});
UserSchema.pre('update', function(done) {
  this.updated_at = new Date();
  done();
});


/* Virtual Fields
----------------------------------------------------------------------------- */
UserSchema.virtual('createdOn')
.get(function () {
  return new Date(this._id.getTimestamp());
});

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("Users", UserSchema);
