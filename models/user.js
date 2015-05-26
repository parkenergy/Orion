/* Includes
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var autopopulate = require('mongoose-autopopulate');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

/* Declaration
----------------------------------------------------------------------------- */
var UserSchema = new mongoose.Schema({

    firstName: { type: String, required: true },

    lastName:  { type: String, required: true },

    email:     { type: String, required: true, index: { unique: true }},

    password:  { type: String, required: true},

    cell:      { type: String },

    role:      {
      type: String,
      enum: ["Technician", "Reviewer", "Corporate", "Admin"],
      default: "Technician"
    },

    units: [{ type: ObjectId, ref: 'Units', index: true }],
    areas: [{ type: ObjectId, ref: 'Areas', index: true }]

});
UserSchema.plugin(autopopulate);

UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);

          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

/* Exports
----------------------------------------------------------------------------- */
module.exports = mongoose.model("Users", UserSchema);
