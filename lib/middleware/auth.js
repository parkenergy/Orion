var auth = {};
var apiToken = "eig6Iethob0negheen7icieghae6Iemiewichoo9sheay2rohe"; //change to public key auth

auth.authenticated = function(req) {
  if(!req.hasOwnProperty('user')) return false;
  if(!req.user.hasOwnProperty('emails')) return false;

  var isParkEnergy = false;
  var emails = req.user.emails;

  for(var i = 0, len = emails.length; i < len; i++) {
    if(emails[i].split('@')[1] === "parkenergyservices.com") isParkEnergy = true;
    if(emails[i] === 'travissturzl@gmail.com') isParkEnergy = true;
  }

  return isParkEnergy;
};

auth.authorized = function(req) {
  var token = req.get('Authorization');
  return token === "Basic " + apiToken;
};

module.exports = function(req, res, next) {
  if(auth.authenticated(req) || auth.authorized(req)) next();

  res.status(401).send("You are not authorized to view this page");
};
