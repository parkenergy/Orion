/* Includes
----------------------------------------------------------------------------- */
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var successUrl = "/orion";
var failureUrl = "/";

var isProd = process.env.NODE_ENV === "production";
var GOOGLE_CLIENT_ID = isProd ?
  "402483966217-fr69pk5n6ut5k3h3jvhd38tk4n9snnav.apps.googleusercontent.com" :
  "402483966217-c3fgfkqe75ns031ilpros6b2b80mdavr.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = isProd ?
  "I_8HkrM_WgbFMpr21z-TGYde" :
  "MPxRv8Usomo8y_DzRi6BVpvd";
var callbackURL = isProd ?
  "http://orion.parkenergyservices.com/auth/google/callback" :
  "http://localhost:3000/auth/google/callback";

module.exports = function(app) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
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


  app.get('/auth/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/drive' }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: successUrl,
      failureRedirect: failureUrl }));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};
