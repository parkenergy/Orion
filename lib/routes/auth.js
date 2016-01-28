/* Includes
----------------------------------------------------------------------------- */
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var successUrl = "/orion";
var failureUrl = "/";

module.exports = function(app) {
  passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:3000/auth/google/return',
    realm: 'http://localhost:3000/'
  }, function(id, profile, done) {
    var isParkEnergy = false;
    var emails = profile.emails;

    for(var i = 0, len = emails.length; i < len; i++) {
      if(emails[i].split('@')[1] === "parkenergyservices.com") isParkEnergy = true;
      if(emails[i] === 'travissturzl@gmail.com') isParkEnergy = true;
    }

    if(!isParkEnergy) return done("Not a parkenergyservices.com domain account");
    done(null, profile);
  }));


  app.get('/auth/google', passport.authenticate('google'));

  app.get('/auth/google/return',
    passport.authenticate('google', { successRedirect: successUrl,
      failureRedirect: failureUrl }));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};
