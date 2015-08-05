/* Includes
----------------------------------------------------------------------------- */
var passport = require('passport');
var OAuthStrategy = require('passport-oauth-profile').OAuthStrategy;
var GoogleStrategy = require('passport-google').Strategy;
var LocalStrategy = require('passport-local');
var db = require('../models');
var https = require('https');
var successUrl = "/#/myaccount";
var failureUrl = "/#/login?failure=true";

/* Exports
----------------------------------------------------------------------------- */
module.exports = function(app) {

  // expose url's required to use passport-google oauth strategy
	app.post('/auth/local', passport.authenticate('local', {
      successRedirect: successUrl,
      failureRedirect: failureUrl }));

  // expose url's required by in-house identity server
	app.get('/auth/parkenergy', passport.authenticate('parkenergy'));
	app.get('/auth/parkenergy/return/', passport.authenticate('parkenergy', {
      successRedirect: successUrl,
      failureRedirect: failureUrl }));

  // expose url's required to use passport-google oauth strategy
  app.get('/auth/google', passport.authenticate('google'));
  app.get('/auth/google/return',  passport.authenticate('google', {
      successRedirect: successUrl,
      failureRedirect: failureUrl }));

  // exposed endpoint allows the system to check if the user is logged in
  app.get('/authorized', function (req, res) {
  	res.send(req.user || '0');
  });

  // logs the user out of Orion, clears cookies
	app.get('/logout', function (req, res) {
		req.logout();
		req.session.destroy();
    var expired = {expires: new Date(1), path: '/' };
	  res.cookie('connect.sid', '', expired);
		res.cookie('userId',      '', expired);
		res.cookie('userName',    '', expired);
		res.redirect('/');
	});

};

/* Private Functions
----------------------------------------------------------------------------- */
/*******************************************************************************
/////////////////////////////// PASSPORT STUFF /////////////////////////////////
*******************************************************************************/

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  //TODO: find user with id
  db.User.find({where: {_id: id}})
  .success(function (user) {
    return done(null, user);
  }).error(function (err) {
    return done(err);
  });
});

passport.getRealm = function () {
  var env = (!process.env || !process.env.NODE_ENV) ?
		'development' :
		process.env.NODE_ENV;
  switch (env) {
    case "production":
      return 'http://orion.parkenergyservices.com/';
    case "staging":
      return 'http://orion.parkenergyservices.com/';
    case "client":
      return 'http://localhost:3000/';
    case "development":
      return 'http://localhost:3000/';
    case "test":
      return 'http://localhost:3000/';
    default:
      throw new Error("OAuth is not configured for " + env + " environment.");
	}
};

passport.getReturnUrl = function (providerName) {
  if (typeof providerName != "string") {
    throw new Error('providerName must be a string (e.g., "google").');
  }
  var realm = passport.getRealm();
  return realm += '/auth/' + providerName + '/return/';
};

passport.use('local', new LocalStrategy(
  function(username, password, done) {
    db.User.findOne({username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  }
));

// Also "local", but using OAuth protocol for multi-app support
passport.use('parkenergyidentity', new OAuthStrategy({
    requestTokenURL: 'http://parkenergyidentity.herokuapp.com/oauth/request_token/',
    accessTokenURL: 'http://parkenergyidentity.herokuapp.com/oauth/access_token',
    userAuthorizationURL: 'http://parkenergyidentity.herokuapp.com/oauth/authorize',
    consumerKey: 'e8d552f1-98ab-43cb-bce8-8ef7659d1277',//'07318b3d-4401-4c4a-a302-743fbb40625d',
    consumerSecret: 'cdc6c520-becf-413a-82d2-6c04cd46f150',//'46f1f6cb-76a7-46f4-b8ed-743c30ec7d13',
    callbackURL: passport.getReturnUrl('parkenergyidentity')
  },
  function(token, tokenSecret, profile, done) {
		return done(null, profile);
  }
));

passport.use('google', new GoogleStrategy({
    returnURL: passport.getReturnUrl("google"),
    realm: passport.getRealm()
  },
  function(identifier, profile, done) {
    // TODO: find or create user
    return done();
  }
));


/* Passport Documentation
--------------------------------------------------------------------------------

  DOCS: http://passportjs.org

  URLS:

  Expose a url that redirects the user to the OAuth provider for authentication.


    app.get('/auth/provider', passport.authenticate('provider'));

  When complete, the provider will redirect the user back to the return url.
  This url exposes a method capable of finishing the authentication process by
  attempting to obtain an access token from the identity provider.
  If authorization was granted, the user will be logged in.
  Otherwise, authentication has failed.

    app.get('/auth/provider/return', passport.authenticate('provider', {
       successRedirect: '/#/myaccount',
       failureRedirect: '/login' }));

  STRATEGIES:

  refer to specific strategy for documentation
  (e.g., OAuthStrategy, GoogleStrategy...)

----------------------------------------------------------------------------- */
